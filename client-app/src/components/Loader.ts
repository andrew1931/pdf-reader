
export const Loader = () => {
    const el = document.createElement("div");
    el.classList.add("flex", "items-center", "text-sm", "text-zinc-600");
    const staticText = document.createElement("span");
    staticText.innerText = "Loading";
    return el;
};