import { DB, NotEnabledError } from "../../core/DB";
import {
    useOutlineToggle,
    useScrollToggle,
    usePageUpdate,
    useDocumentPageChange,
    useZoom
} from "../../core/hooks";
import { debounce, isTouchDevice } from "../../core/utils";
import { type PdfParsedDocument } from "../../pdf-reader";
import { Toast } from "../Toast";
import { ReadingControls } from "./ReadingControls";
import { createSwiper, SWIPER_BUTTON_NEXT_CLASS } from "./Swiper";

export const Document = (
    pdf: PdfParsedDocument,
    fileName: string,
    lastViewedPage = 0
) => {
    const ANIMATION_DURATION = 300;
    const INACTIVITY_TIMEOUT = 5000;
    const CANVASES_CAPACITY = 30;

    const canvases: HTMLCanvasElement[] = [];

    let isOpen = false;

    const swiper = createSwiper(pdf.numberOfPages, lastViewedPage);
    
    const pageChangeSub = useDocumentPageChange.on((page) => {
        swiper.swipeTo(page as number - 1);
    });

    const zoomSub = useZoom.on((isOn) => {
        if (swiper) {
            swiper.lockSwipes(isOn);
        }
    });

    const controls = ReadingControls(fileName, lastViewedPage, pdf);
    controls.onCloseButtonClick(hideDocument);

    swiper.onSlideChange((index) => {
        initSliderContent(index);
        saveLastViewedPage(fileName, index);
    });
    initSliderContent(lastViewedPage);

    const contentEl = document.createElement("div");
    contentEl.classList.add(
        "flex", 
        "items-center", 
        "w-full",
        "md:max-w-5xl",
    );
    contentEl.appendChild(swiper.target);

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

    function initSliderContent(index: number) {
        if (!swiper) return;
        const slides = swiper.slides as HTMLElement[];
        const render = (index) => {
            if (!slides[index] || slides[index].querySelector("canvas")) {
                return;
            }
            const canvas = document.createElement("canvas");
            canvas.classList.add("max-w-full", "max-h-dvh", "bg-inherit", "absolute");
            canvases.push(canvas);
            pdf.render(canvas, index + 1);
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
        controls.update(index + 1);
    }

    const saveLastViewedPage = debounce((fileName: string, index: number) => {
        DB.editFileMeta(fileName, { lastViewedPage: index })
            .catch((error) => {
                if (!(error instanceof NotEnabledError)) {
                    console.error(error);
                }
            });
    }, 1000);

    function showDocument() {
        if (isOpen) return;
        isOpen = true;
        document.body.appendChild(wrapper);
        useOutlineToggle.emit({
            value: false,
            skippedElement: wrapper
        });
        useScrollToggle.emit({ value: false });
        setTimeout(() => {
            wrapper.classList.remove("opacity-0");
            wrapper.classList.add("opacity-1");
        }, 100);

        DB.editFileMeta(
            fileName, { lastViewedAt: new Date() }
        ).catch((error) => {
            if (!(error instanceof NotEnabledError)) {
                Toast.error(error);
            }
        });
    };

    function hideDocument() {
        if (!isOpen) return;
        pdf.cleanUp();
        canvases.forEach((el) => el.remove());
        canvases.length = 0;
        pageChangeSub();
        zoomSub();
        controls.unsubscribe();

        wrapper.removeChild(controls.target);
        wrapper.classList.add("opacity-0");
        wrapper.classList.remove("opacity-1");
        useOutlineToggle.emit({ value: true });
        useScrollToggle.emit({ value: true });
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

    showDocument();

    if (isTouchDevice()) {
        wrapper.onclick = (e: MouseEvent) => {
            if (
                !isOpen ||
                (e.target as HTMLElement).matches("." + SWIPER_BUTTON_NEXT_CLASS) ||
                (e.target as HTMLElement).matches("." + SWIPER_BUTTON_NEXT_CLASS) ||
                (e.target as HTMLElement).closest(".btn-icon")
            ) return;
            controls.toggle();
        };    
    } else {
        const hideControlsDelayed = debounce(controls.hide, INACTIVITY_TIMEOUT);
        hideControlsDelayed();
        wrapper.onmousemove = () => {
            controls.show();
            hideControlsDelayed();
        };
    }
};