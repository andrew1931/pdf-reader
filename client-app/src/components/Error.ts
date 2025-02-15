import { errorToString } from "../core/utils";
import { ActionButton } from "./Button";
import { Modal } from "./Modal";

export const ModalError = (subtitle: string, text: unknown) => {
    const wrapper = document.createElement("div");
    wrapper.classList.add(
        "flex", 
        "flex-col", 
        "justify-between",
        "w-full",
        "flex-1"
    );
    const errorTitle = document.createElement("p");
    errorTitle.classList.add(
        "w-full",
        "text-sm",
        "text-center",
        "text-slate-500",
        "font-semibold",
    );
    errorTitle.innerText = subtitle;

    const errorText = document.createElement("p");
    errorText.innerText = errorToString(text);
    errorText.classList.add(
        "w-full",
        "text-sm",
        "text-slate-400",
        "mt-2",
        "mb-4",
        "text-center"
    );
    const okButton = ActionButton("OK");
    okButton.onclick = Modal.hide;
    wrapper.append(errorTitle, errorText, okButton);
    return wrapper;
};
