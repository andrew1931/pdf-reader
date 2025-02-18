import { ApiClient } from "./api/api-client";
import { Theme } from "./theme";

export type PdfReaderRenderer = (canvas: HTMLCanvasElement, pageNumber: number) => Promise<void>;

export type PdfParsedDocument = {
    title: string;
    author: string;
    numberOfPages: number;
    render: PdfReaderRenderer;
    cleanUp: () => void;
};

export const PdfReader = (() => {
    const PDF_JS_BASE = "../../../node_modules/pdfjs-dist";
    const C_MAP_URL = PDF_JS_BASE + "/cmaps/";
    // const STANDARD_FONT_DATA_URL = PDF_JS_BASE + "standard_fonts/";
    const SCALE = 2.0;

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
                            render(canvas: HTMLCanvasElement, pageNumber: number) {
                                return new Promise((resolve, reject) => {
                                    pdf
                                        .getPage(pageNumber)
                                        .then((page) => {
                                            const viewport = page.getViewport({ scale: SCALE });
                                            canvas.height = viewport.height;
                                            canvas.width = viewport.width;
   
                                            const renderContext = {
                                                canvasContext: canvas.getContext("2d"),
                                                viewport: viewport,
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
                                                    console.log("Error rendering page: ", error);
                                                    page.cleanup();
                                                    reject();
                                                }
                                            );
                                        });
                                });
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