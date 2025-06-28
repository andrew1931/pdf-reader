import {
   useDocumentPageChange,
   useOutlineToggle,
   useScrollToggle,
   useZoom,
} from '../../core/hooks';
import { CloseIcon } from '../icons/close';
import { BookmarkIcon } from '../icons/bookmark';
import { Modal } from '../Modal';
import { AddBookmark } from './AddBookmark';
import { Range } from '../Range';
import { SearchIcon } from '../icons/search';
import { Search } from './Search';
import { type DocumentText, type PdfParsedDocument } from '../../pdf-reader';
import { ZoomInIcon } from '../icons/zoom-in';
import { ZoomOutIcon } from '../icons/zoom-out';
import { MIN_ZOOM_LEVEL, MAX_ZOOM_LEVEL, zoomHandler } from './zoom-handler';
import { SWIPER_ACTIVE_CLASS, SWIPER_CLASS } from './Swiper';
import { RotateIcon } from '../icons/rotate';
import { InfoIcon } from '../icons/info';
import { DocumentInfo } from '../DocumentPreview/DocumentInfo';
import { DB } from '../../core/DB';
import { Toast } from '../Toast';
import { BookOpenIcon } from '../icons/book-open';
import { TitleIcon } from '../icons/title';
import { attr, children, classList, elem, funState, html, ifElse, ifOnly, on } from 'fundom.js';

type ReadingControlsProps = {
   fileName: string;
   initialPage: number;
   pdf: PdfParsedDocument;
   textOnlyMode: boolean;
   initialFontSizeZoom: number;
   searchHandler: () => Promise<DocumentText>;
   onClose: () => void;
   onFontSizeChange: (fontSizeZoom?: number) => Promise<void>;
   onToggleMode: () => void;
};

export const READING_BUTTON_ICON_CLASS = 'btn-icon';

export const ReadingControls = ({
   fileName,
   initialPage,
   pdf,
   textOnlyMode,
   initialFontSizeZoom,
   searchHandler,
   onClose,
   onFontSizeChange,
   onToggleMode,
}: ReadingControlsProps) => {
   const ANIMATION_DURATION = 500;
   const ANIMATION_CLASS = 'scale-100';
   const FONT_SIZE_STEP = 10;
   const MAX_FONT_SIZE_ZOOM = 250;
   const MIN_FONT_SIZE_ZOOM = 10;

   let numberOfPages = pdf.numberOfPages;
   let currentRotate = 0;
   let currentPage = initialPage;
   let currentFontSizeZoom = initialFontSizeZoom;
   let isShown = false;

   const [getIsVisible, setIsVisible] = funState(false);
   const [getEffects, setEffects] = funState(false);

   const activeSlideCanvas = (): HTMLCanvasElement | null => {
      return document.querySelector(`.${SWIPER_CLASS} .${SWIPER_ACTIVE_CLASS} canvas`);
   };

   const zoomHandlerInstance = zoomHandler(pdf);

   const zoomSub = useZoom.on(() => {
      handleButtonsDisabled();
   });

   const buttonsClasslist = [READING_BUTTON_ICON_CLASS, 'w-12', 'text-slate-500', 'p-3'];
   const animatedElementClasslist = ['z-40', 'scale-0', 'transition-[transform]', 'duration-500'];

   const IconButton = (icon: string, label: string, onClick: () => void) => {
      return elem(
         'button',
         attr({ 'aria-label': label }),
         html(icon),
         classList(...buttonsClasslist),
         on('click', onClick)
      )();
   };

   function createPageRange(): ReturnType<typeof Range> {
      const range = Range(numberOfPages, currentPage);
      range.onChange(useDocumentPageChange.emit);
      range.target.classList.add(
         ...animatedElementClasslist,
         'origin-bottom',
         'absolute',
         'w-auto',
         'bottom-8',
         'md:bottom-4'
      );
      range.target.onclick = (e) => e.stopPropagation();
      return range;
   }

   let pageRange = createPageRange();

   const toggleModeButton = IconButton(
      textOnlyMode ? BookOpenIcon : TitleIcon,
      'Switch view mode',
      onToggleMode
   );

   const rotateButton = IconButton(RotateIcon, 'Rotate document', () => {
      const target = activeSlideCanvas();
      if (!target) return;
      currentRotate += 90;
      if (currentRotate === 360) {
         currentRotate = 0;
      }
      pdf.render(
         target,
         currentPage,
         currentRotate,
         zoomHandlerInstance.isActiveZoom() ? zoomHandlerInstance.level() : undefined
      ).finally(() => zoomHandlerInstance.update(target));
   });

   const fontSizePlusButton = IconButton(ZoomInIcon, 'Increase text font size', () => {
      fontSizePlusButton.disabled = true;
      currentFontSizeZoom += FONT_SIZE_STEP;
      if (currentFontSizeZoom > MAX_FONT_SIZE_ZOOM) {
         currentFontSizeZoom = MAX_FONT_SIZE_ZOOM;
      } else {
         onFontSizeChange(currentFontSizeZoom).then(handleFontSizeButtonsDisabled);
      }
   });
   const fontSizeMinusButton = IconButton(ZoomOutIcon, 'Decrease text font size', () => {
      fontSizeMinusButton.disabled = true;
      currentFontSizeZoom -= FONT_SIZE_STEP;
      if (currentFontSizeZoom < MIN_FONT_SIZE_ZOOM) {
         currentFontSizeZoom = MIN_FONT_SIZE_ZOOM;
      } else {
         onFontSizeChange(currentFontSizeZoom).then(handleFontSizeButtonsDisabled);
      }
   });

   const zoomInButton = IconButton(ZoomInIcon, 'Zoom in document', () => {
      zoomInButton.disabled = true;
      zoomHandlerInstance
         .zoomIn(activeSlideCanvas(), currentPage, currentRotate)
         .finally(handleZoomControlsDisabled);
   });

   const zoomOutButton = IconButton(ZoomOutIcon, 'Zoom out document', () => {
      zoomOutButton.disabled = true;
      zoomHandlerInstance
         .zoomOut(activeSlideCanvas(), currentPage, currentRotate)
         .finally(handleZoomControlsDisabled);
   });

   const bookmarkButton = IconButton(BookmarkIcon, 'Add bookmark', () => {
      Modal.show('Bookmarks', AddBookmark(fileName, currentPage), closeReadingModalCb);
   });

   const searchButton = IconButton(SearchIcon, 'Search in document', () => {
      Modal.show('Search modal', Search(searchHandler), closeReadingModalCb);
   });

   const infoButton = IconButton(InfoIcon, 'Document info', () => {
      DB.getFileMeta(fileName)
         .then((doc) => {
            Modal.show('Document info', DocumentInfo(doc), closeReadingModalCb);
         })
         .catch(Toast.error);
   });

   const closeButton = IconButton(CloseIcon, 'Close document', onClose);

   const buttonsContainer = elem(
      'div',
      classList(
         ...animatedElementClasslist,
         'origin-bottom-right',
         'absolute',
         'right-2',
         'bottom-3',
         'md:bottom-2',
         'flex',
         'flex-col',
         'items-end',
         'ml-auto',
         'px-1',
         'py-2',
         'bg-slate-100',
         'opacity-90',
         'rounded-full'
      ),
      ifOnly(getEffects)(classList(ANIMATION_CLASS)),
      ifElse(textOnlyMode)(
         children(
            closeButton,
            toggleModeButton,
            infoButton,
            fontSizePlusButton,
            fontSizeMinusButton,
            searchButton
         )
      )(
         children(
            closeButton,
            toggleModeButton,
            infoButton,
            rotateButton,
            zoomInButton,
            zoomOutButton,
            searchButton,
            bookmarkButton
         )
      )
   );

   const wrapper = elem(
      'div',
      classList(
         'absolute',
         'bottom-0',
         'left-0',
         'w-full',
         'flex',
         'items-center',
         'justify-center'
      ),
      ifOnly(getIsVisible)(children(buttonsContainer, pageRange.target))
   )();

   function hideControls() {
      if (!isShown) return;
      isShown = false;
      setEffects(false);
      pageRange.target.classList.remove(ANIMATION_CLASS);
      setTimeout(() => {
         if (!isShown) {
            setIsVisible(false);
         }
      }, ANIMATION_DURATION);
   }

   function showControls() {
      if (isShown) return;
      isShown = true;
      // if (wrapper.children.length === 0) {

      // }
      setIsVisible(true);
      handleButtonsDisabled();
      handleZoomControlsDisabled();
      handleFontSizeButtonsDisabled();

      setTimeout(() => {
         if (isShown) {
            setEffects(true);
            pageRange.target.classList.add(ANIMATION_CLASS);
         }
      }, 100);
   }

   function handleFontSizeButtonsDisabled() {
      fontSizePlusButton.disabled = currentFontSizeZoom >= MAX_FONT_SIZE_ZOOM;
      fontSizeMinusButton.disabled = currentFontSizeZoom <= MIN_FONT_SIZE_ZOOM;
   }

   function handleZoomControlsDisabled() {
      zoomOutButton.disabled = zoomHandlerInstance.level() <= MIN_ZOOM_LEVEL;
      zoomInButton.disabled = zoomHandlerInstance.level() >= MAX_ZOOM_LEVEL;
   }

   function handleButtonsDisabled() {
      if (zoomHandlerInstance.isActiveZoom()) {
         pageRange.disable();
         searchButton.disabled = true;
         bookmarkButton.disabled = true;
      } else {
         pageRange.enable();
         searchButton.disabled = false;
         bookmarkButton.disabled = false;
      }
   }

   function closeReadingModalCb() {
      useOutlineToggle.emit({
         value: false,
         skippedElement: wrapper,
      });
      useScrollToggle.emit({ value: false });
   }

   return {
      target: wrapper,
      rotationValue() {
         return currentRotate;
      },
      show() {
         showControls();
      },
      hide() {
         hideControls();
      },
      toggle() {
         if (isShown) {
            hideControls();
         } else {
            showControls();
         }
      },
      updatePageRange(current: number, numOfPages?: number) {
         currentPage = current;
         if (numOfPages !== undefined) {
            numberOfPages = numOfPages;
            if (wrapper.contains(pageRange.target)) {
               wrapper.removeChild(pageRange.target);
            }
            pageRange = createPageRange();
            wrapper.appendChild(pageRange.target);
            setTimeout(() => {
               if (isShown) {
                  pageRange.target.classList.add(ANIMATION_CLASS);
               }
            }, 100);
         } else {
            pageRange.update(currentPage);
         }
      },
      unsubscribe() {
         zoomSub();
         zoomHandlerInstance.unsubscribe();
      },
   };
};
