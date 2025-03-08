import { ApiClient } from "./api/api-client";
import { Theme } from "./theme";

export type PdfReaderRenderer = (
    canvas: HTMLCanvasElement,
    pageNumber: number,
    rotation?: number,
    zoomLevel?: number,
) => Promise<void>;


// const punctuationCharacters = /[!@#$%^&*()-=_+[\]{}|;:'",.<>/?\\]/;
const endLineChars = /[.!?;:]/;

export type DocumentText = { text: string; pageNumber: number }[];

export type ParsedTextItem = {
    text: string;
    height: number;
    left: number;
    right: number;
    bottom: number;
    direction: string;
    textAlign: "start" | "center" | "end",
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
    parseDocumentText:  () => Promise<DocumentParsedText>;
    cleanUp: () => void;
};

export const ROTATION_ATTRIBUTE = "rotation";

export const PdfReader = (() => {
    const INITIAL_PDF_SCALE = 2;
    const PDF_JS_BASE = "../../../node_modules/pdfjs-dist";
    const C_MAP_URL = PDF_JS_BASE + "/cmaps/";
    // const STANDARD_FONT_DATA_URL = PDF_JS_BASE + "/standard_fonts/";

    const parseDocumentText = async (pdf) => {
        const result: DocumentParsedText = [];
        let pageItem: ParsedTextItem = {
            text: "",
            height: 0,
            left: 0,
            right: 0,
            bottom: 0,
            direction: "ltr",
            textAlign: "start",
            marginTop: 0,
        };
        for (let i = 1; i <= pdf.numPages; i++) {
           
            try {
                const page = await pdf.getPage(i);
                const pageWidth = page.getViewport(1).viewBox[2];
                const textContent = await page.getTextContent();

                let minLeftOffset = 0;
                const filteredItems: typeof textContent["items"] = [];
                for (const item of textContent.items) {
                    if (minLeftOffset === 0 || item.transform[4] < minLeftOffset) {
                        minLeftOffset = item.transform[4];
                    }
                    if (item.str !== "" && item.height > 0) {
                        filteredItems.push(item);
                    }
                }

                const handleNewLine = (item) => {
                    if (pageItem.height > 0) {
                        if (result[result.length - 1] && result[result.length - 1].height !== pageItem.height) {
                            pageItem.marginTop = 20;
                        }
                        if (pageItem.left > 60) {
                            pageItem.textAlign = "end";
                        } 
                        // else if (pageItem.left > 25 && pageItem.right > 25) {
                        //     pageItem.textAlign = "center";
                        // } 
                        // console.log(pageItem.left, pageItem.right, pageItem.text)
                        result.push(pageItem);
                    }
                    
                    const left = (item.transform[4] * 100) / pageWidth;
                    const right = ((pageWidth - item.width - item.transform[4]) * 100) / pageWidth;
                    pageItem = {
                        text: item.str,
                        height: item.height,
                        left,
                        right,
                        textAlign: "start",
                        bottom: item.transform[5],
                        direction: item.dir,
                        marginTop: 0
                    };
                };

                const maxStringWidth = pageWidth - (2 * minLeftOffset);
                for (const [index, item] of filteredItems.entries()) {
                    if (index === 0) {
                        handleNewLine(item);
                    } else {
                        const prev = filteredItems[index - 1];
                        const bottomIsNotSame = prev.transform[5] !== item.transform[5] &&
                            prev.transform[5] > (item.transform[5] + item.height);
                        // console.log(item);
                        if (
                            index === 0 ||
                            (
                                bottomIsNotSame &&
                                prev.height !== item.height
                            ) ||
                            (
                                bottomIsNotSame &&
                                (prev.width + prev.transform[4]) < maxStringWidth
                            ) ||
                            (
                                bottomIsNotSame &&
                                endLineChars.test(prev.str.charAt(prev.str.length - 1))
                            )
                        ) {
                            handleNewLine(item);
                        } else {
                            // const isSmallText = prev.height > item.height && item.height > 0;
                            // const prevIsSmall = prev.height < item.height && prev.height > 0;
                            const nextText = " " + item.str;
                            pageItem.text += nextText;
                            pageItem.height = item.height || pageItem.height; // ignore 0 height;
                        }
                    }
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
            if (!("pdfjsLib" in window)) {
                return Promise.reject("Oops pdf script wasn't loaded, please try to reload app");
            }
            // @ts-expect-error loaded to window by script
            if (!window.pdfjsLib.GlobalWorkerOptions.workerSrc) {
            // @ts-expect-error loaded to window by script
                window.pdfjsLib.GlobalWorkerOptions.workerSrc = location.origin + "/pdf.worker.js";
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
                            author: meta.info.Author || "Unknown author",
                            title: meta.info.Title || "Unknown title",
                            pdfVersion: meta.info.PDFFormatVersion || "Unknown pdf version",
                            numberOfPages: pdf.numPages,
                            cleanUp() {
                                pdf.cleanup();
                                pdf.destroy();
                            },
                            render(canvas, pageNumber, rotation = 0, zoomLevel = INITIAL_PDF_SCALE) {
                                return new Promise((resolve) => {
                                    pdf
                                        .getPage(pageNumber)
                                        .then((page) => {
                                            const viewport = page.getViewport({
                                                scale: zoomLevel,
                                                rotation
                                            });
                                            canvas.height = viewport.height;
                                            canvas.width = viewport.width;
                                            canvas.setAttribute(
                                                ROTATION_ATTRIBUTE,
                                                String(rotation)
                                            );
   
                                            const renderContext = {
                                                canvasContext: canvas.getContext("2d"),
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
                                                    ApiClient.logError("[renderTask.promise]", error);
                                                    console.error("Error rendering page: ", error);
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
                                                text: item.str.trim()
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
                            }
                        });
                    },
                    (error) => {
                        ApiClient.logError("[loadingTask]", error);
                        rejectPdfLoad(error);
                    }
                );
            });
        }
    };
})();