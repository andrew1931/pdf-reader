import { useOutlineToggle } from "../../core/hooks";
import { CloseIcon } from "../icons/close";
import { SettingsIcon } from "../icons/settings";
import { Modal } from "../Modal";
import { ReadingSettings } from "./ReadingSettings";

export const ReadingControls = () => {
    let isVisible = true;
    let numberOfPages = 0;
    let currentPage = 0;

    const wrapper = document.createElement("div");

    const closeButton = document.createElement("button");
    closeButton.setAttribute("aria-label", "Close document");
    closeButton.innerHTML = CloseIcon;
    closeButton.classList.add("w-6", "text-slate-300");

    const VISIBLE_CONTROLS_TOP_STYLE = "top-0";
    const HIDDEN_CONTROLS_TOP_STYLE = "-top-20";
    const header = document.createElement("div");
    header.classList.add(
        "flex",
        "justify-end",
        "w-full",
        "absolute",
        "top-0",
        "left-0",
        "bg-transparent",
        "py-4",
        "px-4",
        "md:px-8",
        "transition-[top]",
        "z-40",
        VISIBLE_CONTROLS_TOP_STYLE
    );
    header.append(closeButton);

    const pagesInfo = document.createElement("span");
    pagesInfo.classList.add("text-slate-100", "font-medium", "text-sm", "ml-auto");

    const settingsButton = document.createElement("button");
    settingsButton.setAttribute("aria-label", "Reading settings");
    settingsButton.innerHTML = SettingsIcon;
    settingsButton.classList.add("w-6", "text-slate-100", "ml-auto");
    settingsButton.onclick = (e) => {
        e.stopPropagation();
        Modal.show(
            "Reading settings",
            ReadingSettings({
                numberOfPages, 
                currentPage,
            }),
            () => useOutlineToggle.emit({
                value: false,
                skippedElement: wrapper
            })
        );
    };

    const VISIBLE_CONTROLS_BOTTOM_STYLE = "bottom-0";
    const HIDDEN_CONTROLS_BOTTOM_STYLE = "-bottom-20";
    const footer = document.createElement("div");
    footer.classList.add(
        "flex",
        "justify-center",
        "w-full",
        "absolute",
        "bottom-0",
        "left-0",
        "bg-light-opacity",
        "py-6",
        "px-8",
        "transition-[bottom]",
        "z-40",
        VISIBLE_CONTROLS_BOTTOM_STYLE
    );
    footer.append(pagesInfo, settingsButton);

    function hideControls() {
        isVisible = false;
        header.classList.remove(VISIBLE_CONTROLS_TOP_STYLE);
        header.classList.add(HIDDEN_CONTROLS_TOP_STYLE);
        footer.classList.remove(VISIBLE_CONTROLS_BOTTOM_STYLE);
        footer.classList.add(HIDDEN_CONTROLS_BOTTOM_STYLE);
    }

    function showControls() {
        isVisible = true;
        header.classList.add(VISIBLE_CONTROLS_TOP_STYLE);
        header.classList.remove(HIDDEN_CONTROLS_TOP_STYLE);
        footer.classList.add(VISIBLE_CONTROLS_BOTTOM_STYLE);
        footer.classList.remove(HIDDEN_CONTROLS_BOTTOM_STYLE);
    }

    wrapper.append(header, footer);

    return {
        target: wrapper,
        onClose(cb) {
            closeButton.onclick = cb;
        },
        hide() {
            hideControls();
        },
        show() {
            showControls();
        },
        toggle() {
            if (isVisible) {
                hideControls();
            } else {
                showControls();
            }
        },
        updatePageInfo(current: number, total: number) {
            currentPage = current;
            numberOfPages = total;
            if (total === 0) {
                pagesInfo.innerText = "";
            } else {
                pagesInfo.innerText = current + " of " + total;
            }
        }
    };
};