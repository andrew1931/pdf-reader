import { useOutlineToggle, useScrollToggle } from "../core/hooks";
import { CloseIcon } from "./icons/close";

export const MODAL_ANIMATION_TIME = 300;

export const Modal = (() => {
    let isOpen = false;
    let onCloseCb: () => void = () => {};

    const el = document.createElement("div");
    el.classList.add(
        "w-full",
        "h-full",
        "fixed",
        "z-50",
        "top-0",
        "left-0",
        "flex",
        "justify-center",
        "items-end",
        "md:items-center",
        "transition-colors",
        "duration-300",
        "hidden",
    );

    const backdrop = document.createElement("div");
    backdrop.classList.add(
        "absolute",
        "w-full",
        "h-full"
    );

    const contentWrapper = document.createElement("div");
    contentWrapper.classList.add(
        "modal",
        "flex",
        "flex-col",
        "rounded-t-lg",
        "md:rounded",
        "absolute",
        "w-full",
        "md:w-96",
        "min-h-60",
        "max-h-full",
        "overflow-auto",
        "p-6",
        "transition-transform",
        "duration-300"
    );

    const closIcon = document.createElement("button");
    closIcon.innerHTML = CloseIcon;
    closIcon.onclick = closeModal;
    closIcon.classList.add("w-7", "h-7", "cursor-pointer", "absolute", "right-0", "p-1");

    const title = document.createElement("h4");
    title.classList.add("text-center", "text-sm", "font-semibold");

    const header = document.createElement("div");
    header.classList.add(
        "title",
        "w-full",
        "flex",
        "items-center",
        "justify-center",
        "relative",
        "mb-4"
    );
    header.append(title, closIcon);

    const body = document.createElement("div");
    body.classList.add(
        "w-full",
        "flex",
        "flex-col",
        "mt-1",
        "flex-1"
    );
   
    contentWrapper.append(header, body);
    el.append(backdrop, contentWrapper);
   
    function closeModal() {
        if (isOpen) {
            isOpen = false;
            el.classList.remove("bg-light-opacity");
            contentWrapper.style.transform = `translateY(${window.innerHeight}px)`;
            setTimeout(() => {
                el.classList.add("hidden");
            }, MODAL_ANIMATION_TIME);
            useOutlineToggle.emit({ value: true });
            useScrollToggle.emit(true);
            onCloseCb();
        }
    }

    function showModal(
        modalTitle: string, 
        content: HTMLElement,
        onClose?: () => void,
    ) {
        if (!isOpen) {
            if (typeof onClose === "function") {
                onCloseCb = onClose;
            } else {
                onCloseCb = () => {}; // reset previous callback
            }
            isOpen = true;
            el.classList.remove("hidden");
         
            title.innerText = modalTitle;
            body.innerHTML = "";
            body.appendChild(content);
            setTimeout(() => {
                el.classList.add("bg-light-opacity");
                contentWrapper.style.transform = "translateY(0px)";
            }, 100);
            useOutlineToggle.emit({ value: false, skippedElement: el });
            useScrollToggle.emit(false);
        }
    }

    document.body.appendChild(el);

    backdrop.onclick = closeModal;

    setTimeout(() => {
        contentWrapper.style.transform = `translateY(${window.innerHeight}px)`;
    });

    return {
        show: showModal,
        hide: closeModal,
    };
})();