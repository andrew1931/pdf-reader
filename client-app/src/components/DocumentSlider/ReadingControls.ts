import {
    useDocumentPageChange,
    useOutlineToggle,
    useScrollToggle,
    useZoom
} from "../../core/hooks";
import { CloseIcon } from "../icons/close";
import { BookmarkIcon } from "../icons/bookmark";
import { Modal } from "../Modal";
import { AddBookmark } from "./AddBookmark";
import { Range } from "../Range";
import { SearchIcon } from "../icons/search";
import { Search } from "./Search";
import { type PdfParsedDocument } from "../../pdf-reader";
import { ZoomInIcon } from "../icons/zoom-in";
import { ZoomOutIcon } from "../icons/zoom-out";
import { MIN_ZOOM_LEVEL, MAX_ZOOM_LEVEL, zoomHandler } from "./zoom-handler";
import { SWIPER_ACTIVE_CLASS, SWIPER_CLASS } from "./Swiper";
import { RotateIcon } from "../icons/rotate";
// import { PencilIcon } from "../icons/pencil";
// import { CanvasText } from "./CanvasText";

export const ReadingControls = (
    fileName: string,
    initialPage: number,
    pdfRef: PdfParsedDocument,
) => {
    const ANIMATION_DURATION = 500;
    const ANIMATION_CLASS = "scale-100";
    const numberOfPages = pdfRef.numberOfPages;

    let currentRotate = 0;
    let currentPage = initialPage;
    let isVisible = false;

    const activeSlideCanvas = (): HTMLCanvasElement | null => {
        return document.querySelector(`.${SWIPER_CLASS} .${SWIPER_ACTIVE_CLASS} canvas`);
    };

    const zoomHandlerInstance = zoomHandler(pdfRef);

    const zoomSub = useZoom.on(() => {
        handleButtonsDisabled();
    });

    const buttonsClasslist = [
        "btn-icon",
        "w-12",
        "text-slate-500",
        "p-3",
    ];
    const animatedElementClasslist = [
        "z-40",
        "scale-0",
        "transition-[transform]",
        "duration-500"
    ];

    const IconButton = (icon: string, label: string) => {
        const buttonIcon = document.createElement("button");
        buttonIcon.setAttribute("aria-label", label);
        buttonIcon.innerHTML = icon;
        buttonIcon.classList.add(
            ...buttonsClasslist,
            ...animatedElementClasslist
        );
        return buttonIcon;
    };

    const pageRange = Range(numberOfPages, currentPage);
    pageRange.onChange(useDocumentPageChange.emit);
    pageRange.target.classList.add(
        ...animatedElementClasslist,
        "absolute",
        "w-auto",
        "bottom-8",
        "md:bottom-4"
    );
    pageRange.target.onclick = (e) => e.stopPropagation();

    // const addTextButton = IconButton(PencilIcon, "Add text");
    // addTextButton.onclick = () => CanvasText(fileName, currentPage);

    const rotateButton = IconButton(RotateIcon, "Rotate document");
    rotateButton.onclick = () => {
        const target = activeSlideCanvas();
        if (!target) return;
        currentRotate += 90;
        if (currentRotate === 360) {
            currentRotate = 0;
        }
        pdfRef.render(
            target,
            currentPage,
            currentRotate,
            zoomHandlerInstance.isActiveZoom() ? zoomHandlerInstance.level() : undefined
        )
            .finally(() => zoomHandlerInstance.update(target));
    };

    const zoomInButton = IconButton(ZoomInIcon, "Zoom in document");
    zoomInButton.onclick = () => {
        zoomInButton.disabled = true;
        zoomHandlerInstance.zoomIn(activeSlideCanvas(), currentPage, currentRotate)
            .finally(handleZoomControlsDisabled);
    };

    const zoomOutButton = IconButton(ZoomOutIcon, "Zoom out document");
    zoomOutButton.onclick = () => {
        zoomOutButton.disabled = true;
        zoomHandlerInstance.zoomOut(activeSlideCanvas(), currentPage, currentRotate)
            .finally(handleZoomControlsDisabled);
    };

    const bookmarkButton = IconButton(BookmarkIcon, "Add bookmark");
    bookmarkButton.onclick = () => {
        Modal.show(
            "Bookmarks",
            AddBookmark(fileName, currentPage),
            closeReadingModalCb
        );
    };

    const searchButton = IconButton(SearchIcon, "Search in document");
    searchButton.onclick = () => {
        Modal.show(
            "Search in document",
            Search(pdfRef),
            closeReadingModalCb
        );
    };

    const closeButton = IconButton(CloseIcon, "Close document");

    const buttonsContainer = document.createElement("div");
    buttonsContainer.classList.add(
        "absolute",
        "right-2",
        "bottom-3",
        "md:bottom-0",
        "flex",
        "flex-col",
        "items-end",
        "ml-auto",
        "px-4",
        "py-2"
    );

    const wrapper = document.createElement("div");
    wrapper.classList.add(
        "absolute",
        "bottom-0",
        "left-0",
        "w-full",
        "flex",
        "items-center",
        "justify-center"
    );

    function hideControls() {
        if (!isVisible) return;
        isVisible = false;
        buttonsContainer.childNodes.forEach((child) => {
            (child as HTMLElement).classList.remove(ANIMATION_CLASS);
        });
        pageRange.target.classList.remove(ANIMATION_CLASS);
        setTimeout(() => {
            if (!isVisible) {
                wrapper.innerHTML = "";
            }
        }, ANIMATION_DURATION);
    }

    function showControls() {
        if (isVisible) return;
        isVisible = true;

        if (wrapper.childNodes.length === 0) {
            handleButtonsDisabled();
            handleZoomControlsDisabled();
            buttonsContainer.append(
                closeButton,
                // addTextButton,
                rotateButton,
                zoomInButton,
                zoomOutButton,
                searchButton,
                bookmarkButton,
            );
            wrapper.append(buttonsContainer, pageRange.target);
        }
        setTimeout(() => {
            if (isVisible) {
                buttonsContainer.childNodes.forEach((child) => {
                    (child as HTMLElement).classList.add(ANIMATION_CLASS);
                });
                pageRange.target.classList.add(ANIMATION_CLASS);
            }
        }, 100);
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
            skippedElement: wrapper
        });
        useScrollToggle.emit({ value: false });
    }

    showControls();

    return {
        target: wrapper,
        rotationValue() {
            return currentRotate;
        },
        onCloseButtonClick(cb) {
            closeButton.onclick = cb;
        },
        show() {
            showControls();
        },
        hide() {
            hideControls();
        },
        toggle() {
            if (isVisible) {
                hideControls();
            } else {
                showControls();
            }
        },
        update(current: number) {
            currentPage = current;
            pageRange.update(currentPage);
        },
        unsubscribe() {
            zoomSub();
            zoomHandlerInstance.unsubscribe();
        }
    };
};