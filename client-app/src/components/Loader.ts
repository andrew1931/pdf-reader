import { SpinnerIcon } from "./icons/spinner";

export const Loader = () => {
    const el = document.createElement("div");
    el.classList.add("flex", "items-center");
    el.innerHTML = SpinnerIcon;
    return el;
};