import { errorToString } from "../core/utils";
import { ErrorIcon } from "./icons/error";
import { SuccessIcon } from "./icons/success";

export const Toast = (() => {
    const TOAST_DURATION = 3000;
    const ANIMATION_TIME = 300;

    const toast = (
        title: string,
        message: string,
        mode: "success" | "error"
    ) => {
        const el = document.createElement("div");
        el.classList.add(
            "fixed",
            "top-2",
            "left-2",
            "w-full",
            "md:w-auto",
            "max-w-toast",
            "z-50",
            "px-4",
            "py-2",
            "border",
            "rounded-lg",
            "transition-transform",
            "duration-300"
        );   
        const icon = document.createElement("span");
        icon.classList.add("w-8", "mr-2");
      

        if (mode === "success") {
            icon.innerHTML = SuccessIcon;
            el.classList.add(
                "border-green-500",
                "bg-green-50",
            );
            icon.classList.add("text-green-500");
        } else if (mode === "error") {
            icon.innerHTML = ErrorIcon;
            el.classList.add(
                "border-red-500",
                "bg-red-50",
            );
            icon.classList.add("text-red-500");
        }
   
        const titleEl = document.createElement("span");
        titleEl.innerText = title;
        titleEl.classList.add("font-medium", "text-base", "text-slate-800");
   
        const text = document.createElement("span");
        text.innerText = message;
        text.classList.add("text-sm", "text-slate-600");
   
        const textWrapper = document.createElement("div");
        textWrapper.classList.add("flex", "flex-col", "flex-1");
        textWrapper.append(titleEl, text);
   
        const contentWrapper = document.createElement("div");
        contentWrapper.append(icon, textWrapper);
        contentWrapper.classList.add(
            "flex",
            "items-center"
        );
   
        el.style.transform = "translateY(-100px)";
        el.append(contentWrapper);

        document.body.appendChild(el);
        setTimeout(() => {
            el.style.transform = "translateY(5px)";
        }, 100);

        setTimeout(() => {
            el.style.transform = "translateY(-100px)";
            setTimeout(() => {
                el.remove();
            }, ANIMATION_TIME);
        }, TOAST_DURATION);
    };
   
    return {
        success: (message: string) => {
            toast("Success", message, "success");
        },
        error: (message: unknown) => {
            toast("Error", errorToString(message), "error");
        }
    };
})();