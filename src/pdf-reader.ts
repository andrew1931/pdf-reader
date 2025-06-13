import { ApiClient } from './api/api-client';
import { Theme } from './theme';

export type PdfReaderRenderer = (
   canvas: HTMLCanvasElement,
   pageNumber: number,
   rotation?: number,
   zoomLevel?: number
) => Promise<void>;

// const punctuationCharacters = /[!@#$%^&*()-=_+[\]{}|;:'",.<>/?\\]/;
const endLineChars = /[.!?;:]/;

export type DocumentText = { text: string; pageNumber: number }[];

export type ParsedTextItem = {
   text: { value: string; height: number }[];
   textAlign: 'start' | 'center' | 'end';
   marginTop: number;
};

export type DocumentParsedText = ParsedTextItem[];

export type PdfParsedDocument = {
   title: string;
   author: string;
   numberOfPages: number;
   pdfVersion: string;
   render: PdfReaderRenderer;
   getDocumentText: () => Promise<DocumentText>;
   parseDocumentText: () => Promise<DocumentParsedText>;
   cleanUp: () => void;
};

export const ROTATION_ATTRIBUTE = 'rotation';

export const PdfReader = (() => {
   const INITIAL_PDF_SCALE = 2;
   const PDF_JS_BASE = '../../../node_modules/pdfjs-dist';
   const C_MAP_URL = PDF_JS_BASE + '/cmaps/';
   // const STANDARD_FONT_DATA_URL = PDF_JS_BASE + "/standard_fonts/";

   const parseDocumentText = async (pdf) => {
      const result: DocumentParsedText = [];
      let lineItem: ParsedTextItem = {
         text: [],
         textAlign: 'start',
         marginTop: 0,
      };
      let prevItem;
      for (let i = 1; i <= 20; i++) {
         try {
            const page = await pdf.getPage(i);
            const pageWidth = page.getViewport(1).viewBox[2];
            const textContent = await page.getTextContent();

            let minLeftOffset = 0;
            const filteredItems: (typeof textContent)['items'] = [];
            for (const item of textContent.items) {
               if (minLeftOffset === 0 || item.transform[4] < minLeftOffset) {
                  minLeftOffset = item.transform[4];
               }
               if (item.str !== '' && item.height > 0) {
                  filteredItems.push(item);
               }
            }

            const startNewLine = (item) => {
               // if (
               //     result[result.length - 1] &&
               //     result[result.length - 1].height !== pageItem.height
               // ) {
               //     pageItem.marginTop = 20;
               // }
               // else if (pageItem.left > 25 && pageItem.right > 25) {
               //     pageItem.textAlign = "center";
               // }

               if (lineItem.text.length > 0) {
                  result.push(lineItem);
               }
               const left = (item.transform[4] * 100) / pageWidth;
               lineItem = {
                  text: [{ value: item.str, height: item.height }],
                  textAlign: left > 60 ? 'end' : 'start',
                  marginTop: 0,
               };
            };

            const maxStringWidth = pageWidth - 2 * minLeftOffset;
            for (let i = 0; i < filteredItems.length; i++) {
               const item = filteredItems[i];
               if (!prevItem) {
                  startNewLine(item);
               } else {
                  // console.log(item)
                  const bottomIsNotSame =
                     prevItem.transform[5] > item.transform[5] + item.height ||
                     prevItem.transform[5] < item.transform[5];
                  if (
                     (bottomIsNotSame && prevItem.height !== item.height) ||
                     (bottomIsNotSame && prevItem.width + prevItem.transform[4] < maxStringWidth) ||
                     (bottomIsNotSame &&
                        endLineChars.test(prevItem.str.charAt(prevItem.str.length - 1)))
                  ) {
                     startNewLine(item);
                  } else {
                     if (prevItem.height === item.height) {
                        lineItem.text[lineItem.text.length - 1].value += ' ' + item.str;
                     } else {
                        lineItem.text.push({ value: item.str, height: item.height });
                     }
                  }
               }
               prevItem = item;
            }
            page.cleanup();
         } catch (error) {
            console.error(error);
         }
      }
      console.log(result);
      return result;
   };

   return {
      read(file: File): Promise<PdfParsedDocument> {
         if (!('pdfjsLib' in window)) {
            return Promise.reject("Oops pdf script wasn't loaded, please try to reload app");
         }
         // @ts-expect-error loaded to window by script
         if (!window.pdfjsLib.GlobalWorkerOptions.workerSrc) {
            // @ts-expect-error loaded to window by script
            window.pdfjsLib.GlobalWorkerOptions.workerSrc = location.origin + '/pdf.worker.js';
         }
         const url = URL.createObjectURL(file);
         return new Promise((resolvePdfLoad, rejectPdfLoad) => {
            // @ts-expect-error loaded to window by script
            const loadingTask = window.pdfjsLib.getDocument({
               url,
               cMapUrl: C_MAP_URL,
               // standardFontDataUrl: STANDARD_FONT_DATA_URL,
               cMapPacked: true,
            }).promise;
            loadingTask.then(
               async (pdf) => {
                  URL.revokeObjectURL(url);
                  const meta = await pdf.getMetadata();
                  resolvePdfLoad({
                     author: meta.info.Author || 'Unknown author',
                     title: meta.info.Title || 'Unknown title',
                     pdfVersion: meta.info.PDFFormatVersion || 'Unknown pdf version',
                     numberOfPages: pdf.numPages,
                     cleanUp() {
                        pdf.cleanup();
                        pdf.destroy();
                     },
                     render(canvas, pageNumber, rotation = 0, zoomLevel = INITIAL_PDF_SCALE) {
                        return new Promise((resolve) => {
                           pdf.getPage(pageNumber)
                              .then((page) => {
                                 const viewport = page.getViewport({
                                    scale: zoomLevel,
                                    rotation,
                                 });
                                 canvas.height = viewport.height;
                                 canvas.width = viewport.width;
                                 canvas.setAttribute(ROTATION_ATTRIBUTE, String(rotation));

                                 const renderContext = {
                                    canvasContext: canvas.getContext('2d'),
                                    viewport,
                                 };

                                 if (Theme.isDarkTheme()) {
                                    // renderContext["pageColors"] = {
                                    //    background: "rgb(54, 54, 54)",
                                    //    fillStyle: "rgb(255, 255, 255)"
                                    // }
                                    // renderContext["background"] =  "rgba(0, 0, 0, 0)";
                                 }

                                 const renderTask = page.render(renderContext);
                                 renderTask.promise.then(
                                    () => {
                                       page.cleanup();
                                       resolve();
                                    },
                                    (error) => {
                                       ApiClient.logError('[renderTask.promise]', error);
                                       console.error('Error rendering page: ', error);
                                       page.cleanup();
                                    }
                                 );
                              })
                              .catch(console.error);
                        });
                     },
                     async getDocumentText() {
                        const result: DocumentText = [];
                        for (let i = 1; i <= pdf.numPages; i++) {
                           try {
                              const page = await pdf.getPage(i);
                              const textContent = await page.getTextContent();
                              textContent.items.forEach((item) => {
                                 result.push({
                                    pageNumber: i,
                                    text: item.str.trim(),
                                 });
                              });
                              page.cleanup();
                           } catch (error) {
                              console.error(error);
                           }
                        }
                        return result;
                     },
                     async parseDocumentText() {
                        return await parseDocumentText(pdf);
                     },
                  });
               },
               (error) => {
                  ApiClient.logError('[loadingTask]', error);
                  rejectPdfLoad(error);
               }
            );
         });
      },
   };
})();
