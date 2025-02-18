import { DB, NotEnabledError } from "../../core/DB";
import {
    useOutlineToggle,
    useScrollToggle,
    usePageUpdate,
    useDocumentPageChange
} from "../../core/hooks";
import { debounce } from "../../core/utils";
import { type PdfParsedDocument, type PdfReaderRenderer } from "../../pdf-reader";
import { Toast } from "../Toast";
import { ReadingControls } from "./ReadingControls";
import { createSwiper } from "./Swiper";

const ANIMATION_DURATION = 300;
export const Document = (() => {
    const canvases: HTMLCanvasElement[] = [];
    const CANVASES_CAPACITY = 30;

    let swiper;
    let isOpen = false;

    const contentEl = document.createElement("div");
    contentEl.classList.add(
        "flex", 
        "items-center", 
        "w-full",
        "max-w-2xl"
    );

    const controls = ReadingControls();
    controls.onClose(hideModal);

    function initSliderContent(renderer: PdfReaderRenderer, index: number) {
        if (!swiper) return;
        const slides = swiper.slides as HTMLElement[];
        const render = (index) => {
            if (!slides[index] || slides[index].querySelector("canvas")) {
                return;
            }
            const canvas = document.createElement("canvas");
            canvas.classList.add("max-w-full", "max-h-dvh", "bg-inherit",);
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
        controls.update(index + 1, slides.length);
    }

    let openPdf: PdfParsedDocument | null = null;

    const saveLastViewedPage = debounce((fileName: string, index: number) => {
        DB.editFileMeta(fileName, { lastViewedPage: index })
            .catch((error) => {
                if (!(error instanceof NotEnabledError)) {
                    console.error(error);
                }
            });
    }, 1000);

    function initSwiper(
        pdf: PdfParsedDocument,
        fileName: string,
        initialPage: number
    ) {
        openPdf = pdf;
        const initialIndex = initialPage || 0;
        swiper = createSwiper(pdf.numberOfPages, initialIndex);
        swiper.onSlideChange((index) => {
            initSliderContent(pdf.render, index);
            saveLastViewedPage(fileName, index);
        });
        initSliderContent(pdf.render, initialIndex);
        contentEl.innerHTML = "";
        contentEl.appendChild(swiper.target);
        showModal(fileName, initialIndex + 1, pdf.numberOfPages);
        DB.editFileMeta(fileName, { lastViewedAt: new Date() }
        ).catch((error) => {
            if (!(error instanceof NotEnabledError)) {
                Toast.error(error);
            }
        });
    }

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
    wrapper.onclick = (e: MouseEvent) => {
        if (
            !isOpen ||
            (e.target as HTMLElement).matches(".swiper-button-next") ||
            (e.target as HTMLElement).matches(".swiper-button-prev")
        ) return;
        controls.toggle();
    };

    function showModal(fileName: string, current: number, total: number) {
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
            controls.show(fileName, current, total);
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
        show(
            pdf: PdfParsedDocument,
            fileName: string,
            lastViewedPage: number
        ) {
            initSwiper(pdf, fileName, lastViewedPage);
        },
    };
})();