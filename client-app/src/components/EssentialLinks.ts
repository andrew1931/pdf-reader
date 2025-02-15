import { AskQuestionModal } from "./modals/ask-question-modal";
import { PolicyModal } from "./modals/policy-modal";

export const A = (label: string, cb: () => void) => {
    const link = document.createElement("a");
    link.setAttribute("href", "");
    link.classList.add(
        "link",
        "text-xs",
        "underline",
        "px-1",
        "cursor-pointer"
    );
    link.innerText = label;
    link.onclick = (e) => {
        e.preventDefault();
        cb();
    };
    return link;
};

export const EssentialLinks = (): HTMLElement => {
    const el = document.createElement("div");
    el.classList.add("flex", "justify-center");

    const policyLink = A("Our policy", PolicyModal);
   
    const contactLink = A("Contact us", AskQuestionModal);

    el.append(policyLink, contactLink);
    return el;
};