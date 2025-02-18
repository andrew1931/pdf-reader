import { useDocumentPageChange, useOutlineToggle } from "../../core/hooks";
import { CloseIcon } from "../icons/close";
import { BookmarkIcon } from "../icons/bookmark";
import { Modal } from "../Modal";
import { AddBookmark } from "./AddBookmark";
import { Range } from "../Range";

export const ReadingControls = () => {
    const ANIMATION_DURATION = 500;
    let isVisible = true;
    let numberOfPages = 0;
    let currentPage = 0;
    let fileName = "";

    const wrapper = document.createElement("div");

    const buttonsClasslist = [
        "w-6",
        "text-slate-400",
        "my-3",
    ];

    const bookmarkButton = document.createElement("button");
    bookmarkButton.setAttribute("aria-label", "Add bookmark");
    bookmarkButton.innerHTML = BookmarkIcon;
    bookmarkButton.classList.add(...buttonsClasslist);
    bookmarkButton.onclick = () => {
        Modal.show(
            "Bookmark",
            AddBookmark(fileName, currentPage),
            () => useOutlineToggle.emit({
                value: false,
                skippedElement: wrapper
            })
        );
    };

    const closeButton = document.createElement("button");
    closeButton.setAttribute("aria-label", "Close document");
    closeButton.innerHTML = CloseIcon;
    closeButton.classList.add(...buttonsClasslist);

    const buttonsContainer = document.createElement("div");
    buttonsContainer.classList.add(
        "absolute",
        "rounded",
        "z-40",
        "right-2",
        "bottom-2",
        "flex",
        "flex-col",
        "items-end",
        "ml-auto",
        "p-4",
        "opacity-0",
        "transition-opacity",
        "duration-500"
    );

    let pageRange = Range(1, numberOfPages, currentPage);

    function hideControls() {
        isVisible = false;
        buttonsContainer.classList.add("opacity-0");
        setTimeout(() => {
            if (!isVisible) {
                buttonsContainer.innerHTML = "";
            }
        }, ANIMATION_DURATION);
    }

    function showControls() {
        isVisible = true;
        buttonsContainer.classList.remove("opacity-0");
        if (buttonsContainer.childNodes.length === 0) {
            pageRange = Range(1, numberOfPages, currentPage);
            pageRange.onChange(useDocumentPageChange.emit);
            pageRange.target.onclick = (e) => {
                e.stopPropagation();
            };
            buttonsContainer.append(
                closeButton,
                bookmarkButton,
                pageRange.target
            );
        }
    }

    wrapper.append(buttonsContainer);

    return {
        target: wrapper,
        onClose(cb) {
            closeButton.onclick = cb;
        },
        hide() {
            hideControls();
        },
        show(name: string, current: number, total: number) {
            buttonsContainer.innerHTML = "";
            fileName = name;
            currentPage = current;
            numberOfPages = total;
            showControls();
        },
        toggle() {
            if (isVisible) {
                hideControls();
            } else {
                showControls();
            }
        },
        update(current: number, total: number) {
            currentPage = current;
            numberOfPages = total;
            pageRange.update(currentPage);
        }
    };
};