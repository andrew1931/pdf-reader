import { useDocumentPageChange, useOutlineToggle, useScrollToggle } from "../../core/hooks";
import { CloseIcon } from "../icons/close";
import { BookmarkIcon } from "../icons/bookmark";
import { Modal } from "../Modal";
import { AddBookmark } from "./AddBookmark";
import { Range } from "../Range";
import { SearchIcon } from "../icons/search";
import { Search } from "./Search";
import { type PdfParsedDocument } from "../../pdf-reader";

export const ReadingControls = (
    fileName: string,
    currentPage: number,
    pdfRef: PdfParsedDocument
) => {
    const numberOfPages = pdfRef.numberOfPages;
    const ANIMATION_DURATION = 500;

    let isVisible = false;

    const wrapper = document.createElement("div");

    const buttonsClasslist = [
        "btn-icon",
        "w-6",
        "text-slate-500",
        "my-3",
    ];
    const animatedElementClasslist = [
        "z-40",
        "opacity-0",
        "transition-opacity",
        "duration-500"
    ];

    const bookmarkButton = document.createElement("button");
    bookmarkButton.setAttribute("aria-label", "Add bookmark");
    bookmarkButton.innerHTML = BookmarkIcon;
    bookmarkButton.classList.add(
        ...buttonsClasslist,
        ...animatedElementClasslist
    );
    bookmarkButton.onclick = () => {
        Modal.show(
            "Bookmarks",
            AddBookmark(fileName, currentPage),
            closeReadingModalCb
        );
    };

    const searchButton = document.createElement("button");
    searchButton.setAttribute("aria-label", "Search document");
    searchButton.innerHTML = SearchIcon;
    searchButton.classList.add(
        ...buttonsClasslist,
        ...animatedElementClasslist
    );
    searchButton.onclick = () => {
        Modal.show(
            "Search in document",
            Search(pdfRef),
            closeReadingModalCb
        );
    };

    const closeButton = document.createElement("button");
    closeButton.setAttribute("aria-label", "Close document");
    closeButton.innerHTML = CloseIcon;
    closeButton.classList.add(
        ...buttonsClasslist,
        ...animatedElementClasslist
    );

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

    let pageRange = Range(numberOfPages, currentPage);

    function hideControls() {
        if (!isVisible) return;
        isVisible = false;
        buttonsContainer.childNodes.forEach((child) => {
            (child as HTMLElement).classList.add("opacity-0");
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
            pageRange = Range(numberOfPages, currentPage);
            pageRange.onChange(useDocumentPageChange.emit);
            pageRange.target.classList.add(...animatedElementClasslist);
            pageRange.target.onclick = (e) => {
                e.stopPropagation();
            };
            buttonsContainer.append(
                closeButton,
                searchButton,
                bookmarkButton,
                pageRange.target
            );
        }
        buttonsContainer.childNodes.forEach((child) => {
            (child as HTMLElement).classList.remove("opacity-0");
        });
    }

    wrapper.append(buttonsContainer);

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
        }
    };
};