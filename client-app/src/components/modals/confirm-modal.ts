import { ActionButton, SubmitButton } from "../Button";
import { Modal, MODAL_ANIMATION_TIME } from "../Modal";

type ConfirmButtonItem = {
   label: string;
   fn: () => void;
};

export const ConfirmModal = (
    warmText: string,
    cancel: ConfirmButtonItem,
    submit: ConfirmButtonItem
) => {
    const text = document.createElement("span");
    text.innerText = warmText;
    text.classList.add("text-sm", "mb-8", "text-slate-500", "text-center");
   
    const cancelBtn = ActionButton(cancel.label);
    cancelBtn.classList.add("mx-1");
    cancelBtn.onclick = () => {
        Modal.hide();
        cancel.fn();
    };

    const continueBtn = SubmitButton(submit.label);
    continueBtn.classList.add("mx-1");
    continueBtn.onclick = () => {
        Modal.hide();
        // setTimeout for modal close animation
        setTimeout(() => {
            submit.fn();
        }, MODAL_ANIMATION_TIME);
    };

    const buttonsWrapper = document.createElement("div");
    buttonsWrapper.classList.add("flex", "justify-center");
    buttonsWrapper.append(cancelBtn, continueBtn);

    const el = document.createElement("div");
    el.classList.add("flex-1", "flex", "flex-col", "justify-center");
    el.append(text, buttonsWrapper);
   
    Modal.show("Friendly warning", el);
};