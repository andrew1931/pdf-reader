import { ApiClient } from "./api/api-client";
import { Theme } from "./theme";

export type PdfReaderRenderer = (
    canvas: HTMLCanvasElement,
    pageNumber: number,
    rotation?: number,
    zoomLevel?: number,
) => Promise<void>;

export type DocumentText = { text: string; pageNumber: number }[];

export type PdfParsedDocument = {
    title: string;
    author: string;
    numberOfPages: number;
    render: PdfReaderRenderer;
    getDocumentText: () => Promise<DocumentText>;
    cleanUp: () => void;
};

export const ROTATION_ATTRIBUTE = "rotation";

export const PdfReader = (() => {
    const INITIAL_PDF_SCALE = 2;
    const PDF_JS_BASE = "../../../node_modules/pdfjs-dist";
    const C_MAP_URL = PDF_JS_BASE + "/cmaps/";
    // const STANDARD_FONT_DATA_URL = PDF_JS_BASE + "/standard_fonts/";

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