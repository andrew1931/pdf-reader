import {
   children,
   classList,
   cmp,
   elem,
   funState,
   ifElse,
   ifOnly,
   list,
   on,
   style,
   txt,
} from 'fundom.js';
import { DB, type DbFileMeta, DEFAULT_FONT_SIZE_ZOOM, NotEnabledError } from '../../core/DB';
import {
   useOutlineToggle,
   useScrollToggle,
   usePageUpdate,
   useDocumentPageChange,
   useZoom,
   useWindowResize,
   useDocumentLoader,
} from '../../core/hooks';
import { debounce, isTouchDevice } from '../../core/utils';
import {
   type DocumentParsedText,
   ROTATION_ATTRIBUTE,
   type PdfParsedDocument,
   type DocumentText,
   type ParsedTextItem,
} from '../../pdf-reader';
import { Loader } from '../Loader';
import { Toast } from '../Toast';
import { READING_BUTTON_ICON_CLASS, ReadingControls } from './ReadingControls';
import { createSwiper, SWIPER_BUTTON_NEXT_CLASS } from './Swiper';

type DocumentProps = {
   pdf: PdfParsedDocument;
   doc: DbFileMeta;
   textOnlyMode: boolean;
};

export const Document = ({ pdf, doc, textOnlyMode }: DocumentProps) => {
   const WINDOW_RESIZE_DELAY = 500;
   const SAVE_PAGE_NUMBER_DELAY = 1000;
   const INACTIVITY_TIMEOUT = 5000;
   const CANVASES_CAPACITY = 30;

   const lastViewedPage = (textOnlyMode ? doc.lastViewedPageTextMode : doc.lastViewedPage) || 0;

   const [getIsLoading, setIsLoading] = funState(textOnlyMode);
   const [getEffects, setEffects] = funState(false);

   let isOpen = false;

   let textSlidesList: HTMLElement[][] = [];
   let parsedText: DocumentParsedText = [];
   let searchText: DocumentText = [];
   let canvases: HTMLCanvasElement[] = [];

   const swiper = createSwiper(pdf.numberOfPages, lastViewedPage);

   const pageChangeSub = useDocumentPageChange.on((page) => {
      swiper.swipeTo((page as number) - 1);
   });

   const zoomSub = useZoom.on((isOn) => {
      if (swiper) {
         swiper.lockSwipes(isOn);
      }
   });

   const textRenderer = debounce(renderTextSlides, WINDOW_RESIZE_DELAY);
   const windowSizeSub = useWindowResize.on(() => {
      if (parsedText.length > 0) {
         textRenderer();
      }
   });

   const controls = ReadingControls({
      fileName: doc.fileName,
      initialPage: lastViewedPage + 1,
      pdf,
      textOnlyMode,
      initialFontSizeZoom: doc.fontSizeZoom || DEFAULT_FONT_SIZE_ZOOM,
      searchHandler,
      onClose: hideDocument,
      onFontSizeChange: renderTextSlides,
      onToggleMode: () => {
         hideDocument(true);
         DB.getFileMeta(doc.fileName).then((doc) =>
            Document({ pdf, doc, textOnlyMode: !textOnlyMode })
         );
      },
   });

   const hideControlsDelayed = debounce(controls.hide, INACTIVITY_TIMEOUT);
   hideControlsDelayed();

   const saveLastViewedPage = debounce((fileName: string, index: number) => {
      DB.editFileMeta(
         fileName,
         textOnlyMode ? { lastViewedPageTextMode: index } : { lastViewedPage: index }
      ).catch((error) => {
         if (!(error instanceof NotEnabledError)) {
            console.error(error);
         }
      });
   }, SAVE_PAGE_NUMBER_DELAY);

   if (textOnlyMode) {
      pdf.parseDocumentText()
         .then((res) => {
            if (res.length === 0) {
               throw 'We were not able to parse this document as text :(';
            }
            parsedText = res;
            controls.show();
            useDocumentLoader.emit(false);
            return renderTextSlides();
         })
         .then(() => {
            swiper.onSlideChange((index) => {
               controls.updatePageRange(index + 1);
               saveLastViewedPage(doc.fileName, index);
               initTextSlideContent(index);
            });
         })
         .catch((error) => {
            Toast.error(error);
            hideDocument();
         });
   } else {
      swiper.onSlideChange((index) => {
         initCanvasSliderContent(index);
         saveLastViewedPage(doc.fileName, index);
      });
      initCanvasSliderContent(lastViewedPage);
      controls.show();
   }

   const loaderSub = useDocumentLoader.on((loading) => {
      setIsLoading(loading);
   });

   const wrapper = elem(
      'div',
      classList(
         'document-view-container',
         'flex',
         'w-full',
         'h-full',
         'justify-center',
         'fixed',
         'top-0',
         'left-0',
         'bg-slate-50',
         'z-40',
         'transition-opacity',
         'duration-500'
      ),
      ifOnly(getEffects)(classList('opacity-0')),
      children(
         elem(
            'div',
            classList('flex', 'items-center', 'w-full', 'md:max-w-5xl'),
            children(swiper.target)
         ),
         controls.target,
         elem(
            'div',
            classList(
               'h-full',
               'w-full',
               'bg-white',
               'flex',
               'items-center',
               'justify-center',
               'absolute',
               'left-0',
               'top-0',
               'z-20',
               'opacity-90'
            ),
            ifOnly(cmp(getIsLoading, (v) => v === false))(classList('hidden')),
            children(Loader())
         )
      ),
      ifElse(isTouchDevice())(
         on('click', (e) => {
            if (getIsLoading()) return;
            if (
               !isOpen ||
               (e.target as HTMLElement).matches('.' + SWIPER_BUTTON_NEXT_CLASS) ||
               (e.target as HTMLElement).matches('.' + SWIPER_BUTTON_NEXT_CLASS) ||
               (e.target as HTMLElement).closest('.' + READING_BUTTON_ICON_CLASS)
            )
               return;
            controls.toggle();
         })
      )(
         on('mousemove', () => {
            if (getIsLoading()) return;
            controls.show();
            hideControlsDelayed();
         })
      )
   )();

   const SlideTextPage = () => {
      return elem(
         'div',
         classList('w-full', 'max-w-3xl', 'h-full', 'bg-inherit', 'px-4', 'md:px-12', 'py-4')
      )();
   };

   async function renderTextSlides(fontSizeZoom?: number): Promise<void> {
      if (fontSizeZoom !== undefined) {
         await DB.editFileMeta(doc.fileName, { fontSizeZoom }).catch((error) => {
            if (!(error instanceof NotEnabledError)) {
               Toast.error(error);
            }
         });
      } else {
         fontSizeZoom = (await DB.getFileMeta(doc.fileName)).fontSizeZoom || DEFAULT_FONT_SIZE_ZOOM;
      }

      const LineElement = (item: ParsedTextItem) => {
         return elem(
            'p',
            classList('w-full'),
            list(item.text, (tag) => {
               return elem(
                  'span',
                  style({ fontSize: Math.round((tag.height * fontSizeZoom) / 100) + 'px' }),
                  txt(tag.value, { useTextContent: true })
               );
            }),
            ifOnly(item.textAlign === 'start' && item.marginTop > 0)(style({ textIndent: '5%' }))
         )();
      };

      const cutOverflowedText = (
         line: HTMLElement,
         wrapperHeight: number,
         slideIndex: number
      ): Node | null => {
         const textContent = line.textContent || '';
         const range = document.createRange();
         range.setStart(line, 0);
         range.setEnd(line, 1);
         const lineRects = range.getClientRects();
         let targetLine = -1;
         for (let i = 0; i < lineRects.length; i++) {
            if (lineRects[i].top + lineRects[i].height > wrapperHeight) {
               targetLine = i;
               break;
            }
         }
         if (targetLine === -1) {
            return null;
         }
         let childI = 0;
         let i = 0;
         while (i < textContent.length) {
            try {
               range.setStart(line.children[childI].firstChild as ChildNode, 0);
               range.setEnd(line.children[childI].firstChild as ChildNode, i + 1);
            } catch (error) {
               console.log(error);
               childI++;
               if (line.children.length < childI) {
                  break;
               }
               continue;
            }

            i++;
            // console.log(range.getClientRects().length)
            const lineIndex = range.getClientRects().length - 1;
            if (lineIndex === targetLine) {
               const cloned = line.cloneNode();
               cloned.textContent = textContent.substring(i, textContent.length);
               line.textContent = textContent.substring(0, i);
               searchText[searchText.length - 1].text = line.textContent;
               if (line.textContent.length === 0) {
                  searchText.pop();
                  textSlidesList[slideIndex].pop();
                  line.remove();
               }
               return cloned;
            }
         }
         return null;
      };

      const fillTextSlidesAndSearchTextLists = (
         div: HTMLElement,
         slideIndex: number,
         start: number
      ) => {
         textSlidesList = [];
         searchText = [];
         let cutLineFromPrevPage: Node | null = null;
         while (start < parsedText.length - 1) {
            if (!textSlidesList[slideIndex]) {
               textSlidesList.push([]);
               div.innerHTML = '';
            }

            const handlePageOverflow = (element: HTMLElement) => {
               const { top, height } = element.getBoundingClientRect();
               const verticalPadding =
                  parseFloat(getComputedStyle(div).paddingTop.split('px')[0]) * 2;
               const divHeight = div.clientHeight - verticalPadding;
               if (top + height > divHeight) {
                  cutLineFromPrevPage = cutOverflowedText(element, divHeight, slideIndex);
                  slideIndex = slideIndex + 1;
                  return true;
               }
               cutLineFromPrevPage = null;
               return false;
            };

            if (cutLineFromPrevPage !== null) {
               div.appendChild(cutLineFromPrevPage);
               textSlidesList[slideIndex].push(cutLineFromPrevPage);
               searchText.push({
                  pageNumber: slideIndex + 1,
                  text: (cutLineFromPrevPage as Node).textContent || '',
               });
               if (handlePageOverflow(cutLineFromPrevPage)) {
                  continue;
               }
            }

            for (let i = start; i < parsedText.length; i++) {
               start = i + 1;
               const element = LineElement(parsedText[i]);
               div.appendChild(element);
               textSlidesList[slideIndex].push(element);
               searchText.push({
                  pageNumber: slideIndex + 1,
                  text: element.textContent || '',
               });
               if (handlePageOverflow(element)) {
                  break;
               }
            }
         }
         return slideIndex;
      };

      swiper.clearSlides();
      swiper.slides()[0].innerHTML = '';
      const tempSlide = SlideTextPage();
      swiper.slides()[0].appendChild(tempSlide);
      const lastSlidePageNumber = fillTextSlidesAndSearchTextLists(tempSlide, 0, 0) + 1;
      tempSlide.remove();
      swiper.slides()[0].innerHTML = '';

      if (swiper.slides().length > lastSlidePageNumber) {
         swiper.removeSlides(lastSlidePageNumber);
      } else if (swiper.slides().length < lastSlidePageNumber) {
         swiper.addSlides(lastSlidePageNumber - swiper.slides().length);
      }
      controls.updatePageRange(
         swiper.current() < lastSlidePageNumber ? swiper.current() + 1 : lastSlidePageNumber,
         lastSlidePageNumber
      );
      initTextSlideContent(swiper.current());
   }

   function initTextSlideContent(index: number) {
      const slides = swiper.slides();
      const render = (index) => {
         if (!slides[index] || !textSlidesList[index]) return;
         const slidePage = SlideTextPage();
         slidePage.append(...textSlidesList[index]);
         slides[index].innerHTML = '';
         slides[index].appendChild(slidePage);
      };
      swiper.clearSlides();
      render(index - 1);
      render(index);
      render(index + 1);
   }

   function initCanvasSliderContent(index: number) {
      const slides = swiper.slides();
      const render = (index) => {
         if (!slides[index]) return;

         const targetCanvas = slides[index].querySelector('canvas');
         if (targetCanvas) {
            const slideRotation = Number(targetCanvas.getAttribute(ROTATION_ATTRIBUTE));
            if (slideRotation === controls.rotationValue()) {
               return;
            } else {
               targetCanvas.remove(); // remove to rerender with new rotation value
            }
         }

         const canvas = elem(
            'canvas',
            classList('max-w-full', 'max-h-dvh', 'bg-inherit', 'absolute')
         )();
         canvases.push(canvas);
         pdf.render(canvas, index + 1, controls.rotationValue());
         slides[index].appendChild(canvas);
         if (canvases.length > CANVASES_CAPACITY) {
            for (let i = 0; i < canvases.length - CANVASES_CAPACITY; i++) {
               const el = canvases[i];
               el.remove();
               canvases.splice(0, i);
            }
         }
      };

      render(index - 1);
      render(index);
      render(index + 1);
      controls.updatePageRange(index + 1);
   }

   async function searchHandler(): Promise<DocumentText> {
      if (searchText.length === 0) {
         if (textOnlyMode) {
            await renderTextSlides();
         } else {
            searchText = await pdf.getDocumentText();
         }
      }
      return searchText;
   }

   function showDocument() {
      if (isOpen) return;
      isOpen = true;
      document.body.appendChild(wrapper);
      useOutlineToggle.emit({
         value: false,
         skippedElement: wrapper,
      });
      useScrollToggle.emit({ value: false });
      setTimeout(() => {
         setEffects(false);
      }, 100);

      DB.editFileMeta(doc.fileName, { lastViewedAt: new Date() }).catch((error) => {
         if (!(error instanceof NotEnabledError)) {
            Toast.error(error);
         }
      });
   }

   function hideDocument(hideToReopen = false) {
      if (!isOpen) return;
      if (!hideToReopen) {
         pdf.cleanUp();
      }

      pageChangeSub();
      zoomSub();
      windowSizeSub();
      loaderSub();
      controls.unsubscribe();

      parsedText = [];
      searchText = [];
      textSlidesList.forEach((slide) => {
         slide.forEach((el) => el.remove());
      });
      textSlidesList = [];
      canvases.forEach((el) => el.remove());
      canvases = [];

      // wrapper.removeChild(controls.target);
      setEffects(true);
      useOutlineToggle.emit({ value: true });
      useScrollToggle.emit({ value: true });
      usePageUpdate.emit();

      try {
         document.body.removeChild(wrapper);
      } catch (error) {
         console.warn(error);
      }
      isOpen = false;
   }

   useDocumentLoader.emit(textOnlyMode);
   showDocument();
};
