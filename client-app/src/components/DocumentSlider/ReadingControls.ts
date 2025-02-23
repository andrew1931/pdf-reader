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

export const ReadingControls = (
    fileName: string,
    initialPage: number,
    pdfRef: PdfParsedDocument,
) => {
    const ANIMATION_DURATION = 500;
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
        "origin-right",
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
    pageRange.target.classList.add(...animatedElementClasslist);
    pageRange.target.onclick = (e) => e.stopPropagation();

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
        "rounded",
        "right-2",
        "bottom-2",
        "flex",
        "flex-col",
        "items-end",
        "ml-auto",
        "p-4"
    );

    const wrapper = document.createElement("div");
    wrapper.append(buttonsContainer);

    function hideControls() {
        if (!isVisible) return;
        isVisible = false;
        buttonsContainer.childNodes.forEach((child) => {
            (child as HTMLElement).classList.remove("scale-100");
        });
        setTimeout(() => {
            if (!isVisible) {
                buttonsContainer.innerHTML = "";
            }
        }, ANIMATION_DURATION);
    }

    function showControls() {
        if (isVisible) return;
        isVisible = true;

        if (buttonsContainer.childNodes.length === 0) {
            handleButtonsDisabled();
            handleZoomControlsDisabled();
            buttonsContainer.append(
                closeButton,
                rotateButton,
                zoomInButton,
                zoomOutButton,
                searchButton,
                bookmarkButton,
                pageRange.target
            );
        }
        setTimeout(() => {
            if (isVisible) {
                buttonsContainer.childNodes.forEach((child) => {
                    (child as HTMLElement).classList.add("scale-100");
                });
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