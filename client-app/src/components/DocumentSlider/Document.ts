import { DB, type DbFileMeta, NotEnabledError } from "../../core/DB";
import {
    useOutlineToggle,
    useScrollToggle,
    usePageUpdate,
    useDocumentPageChange
} from "../../core/hooks";
import { debounce } from "../../core/utils";
import { Toast } from "../Toast";
import { type PdfParsedDocument, PdfReader, type PdfReaderRenderer } from "./pdf-reader";
import { ReadingControls } from "./ReadingControls";
import { createSwiper } from "./Swiper";

const ANIMATION_DURATION = 300;
export const Document = (() => {
    const contentEl = document.createElement("div");
    contentEl.classList.add(
        "flex", 
        "items-center", 
        "w-full",
        "max-w-2xl"
    );

    const controls = ReadingControls();
    controls.onClose(hideModal);

    const wrapper = document.createElement("div");
    wrapper.classList.add(
        "document-view-container",
        "flex",
        "w-full",
        "h-full",
        "justify-center",
        "fixed",
        "top-0",
        "left-0",
        "bg-slate-50",
        "z-40",
        "duration-300",
        "opacity-0",
    );
    wrapper.append(contentEl, controls.target);

    const canvases: HTMLCanvasElement[] = [];
    const CANVASES_CAPACITY = 20;

    function initSliderContent(slides: HTMLElement[], renderer: PdfReaderRenderer, index: number) {
        const render = (index) => {
            if (!slides[index] || slides[index].querySelector("canvas")) {
                return;
            }
            const canvas = document.createElement("canvas");
            canvas.classList.add("max-w-full", "max-h-full", "bg-inherit",);
            canvases.push(canvas);
            renderer(canvas, index + 1).catch(console.error);
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
        controls.updatePageInfo(index + 1, slides.length);
    }

    let swiper;
    let openPdf: PdfParsedDocument | null = null;

    const saveLastViewedPage = debounce<string, number>((fileName: string, index: number) => {
        DB.editFileMeta(fileName, { lastViewedPage: index })
            .catch(console.error);
    }, 1000);

    function initSwiper(
        pdf: PdfParsedDocument,
        fileName: string,
        initialPage: number
    ) {
        openPdf = pdf;
        swiper = createSwiper(pdf.numberOfPages, initialPage || 0);
        swiper.onSlideChange((index) => {
            initSliderContent(swiper.slides, pdf.render, index);
            controls.hide();
            saveLastViewedPage(fileName, index);
        });
        initSliderContent(swiper.slides, pdf.render, initialPage || 0);
        contentEl.innerHTML = "";
        contentEl.appendChild(swiper.target);
    }

    function readPdf(file: File) {
        contentEl.innerHTML = "";
        controls.updatePageInfo(0, 0);
        PdfReader.read(file)
            .then((pdf) => {
                initSwiper(pdf, file.name, 0);
                DB.editFileMeta(file.name, {
                    title: pdf.title,
                    author: pdf.author,
                    numberOfPages: pdf.numberOfPages,
                })
                    .catch((error) => {
                        if (
                            "name" in error && error.name === "ConstraintError" ||
               error instanceof NotEnabledError
                        ) {
                            console.warn(error);
                        } else {
                            Toast.error(error);
                        }
                    });
            })
            .catch((error) => {
                Toast.error(error);
                hideModal();
            });
    }

    let isOpen = false;

    wrapper.onclick = () => {
        if (!isOpen) return;
        controls.toggle();
    };

    function showModal() {
        if (isOpen) return;
        isOpen = true;
        document.body.appendChild(wrapper);
        useOutlineToggle.emit({
            value: false,
            skippedElement: wrapper
        });
        useScrollToggle.emit(false);
        setTimeout(() => {
            wrapper.classList.remove("opacity-0");
            wrapper.classList.add("opacity-1");
            controls.show();
        }, 100);
    };

    function hideModal() {
        if (!isOpen) return;
        if (openPdf) {
            openPdf.cleanUp();
        }
        canvases.forEach((el) => el.remove());
        canvases.length = 0;
        wrapper.classList.add("opacity-0");
        wrapper.classList.remove("opacity-1");
        controls.hide();
        useOutlineToggle.emit({ value: true });
        useScrollToggle.emit(true);
        usePageUpdate.emit();
        setTimeout(() => {
            try {
                document.body.removeChild(wrapper);
            } catch (error) {
                console.warn(error);
            }
            isOpen = false;
        }, ANIMATION_DURATION);
    };

    useDocumentPageChange.on((page) => {
        if (swiper) {
            swiper.swipeTo(page as number - 1);
        }
    });

    return {
        parseAndShow(file: File) {
            readPdf(file);
            showModal();
        },
        show(pdf: PdfParsedDocument, doc: DbFileMeta) {
            initSwiper(pdf, doc.fileName, doc.lastViewedPage);
            showModal();
        },
    };
})();