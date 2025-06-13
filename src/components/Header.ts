import { Link, normalizedPath } from "../core/router";
import { routes } from "../routes.definition";

const menuItems = [
    routes.home,
    routes.settings
];

export const Header = (): HTMLElement => {
    const el = document.createElement("header");
    el.classList.add(
        "header",
        "md:mb-1",
        "flex",
        "justify-center",
        "px-2",
        "fixed",
        "md:relative",
        "left-0",
        "bottom-0",
        "md:bg-transparent",
        "z-40",
        "w-full"
    );
   
    const ul = document.createElement("ul");
    ul.classList.add("flex", "w-full", "justify-around", "md:justify-end");
    menuItems.forEach((item) => {
        const isActive = item.pathname === normalizedPath();
        const link = Link(item.pathname + item.search);
        link.classList.add(
            "btn-icon",
            "flex",
            "flex-col",
            "justify-center",
            "items-center",
            "rounded-full",
            "w-[63px]",
            "h-[63px]",
            "mt-1",
            "mb-2",
            "md:flex-row",
            "md:p-2",
            "md:w-auto",
            "md:h-auto",
            "md:mx-4",
            "md:mt-4",
        );
        if (isActive) {
            link.classList.add("text-button-400");
        }
      
        const iconWrapper = document.createElement("span");
        iconWrapper.classList.add("w-5", "h-5", "mb-[4px]");
        iconWrapper.innerHTML = item.icon;
        const textWrapper = document.createElement("span");
        textWrapper.innerText = item.label;
        textWrapper.classList.add("text-[10px]", "md:underline", "md:text-sm", "md:ml-2");

        link.append(iconWrapper, textWrapper);
      
        const li = document.createElement("li");
        li.appendChild(link);
        ul.appendChild(li);
    });
    el.appendChild(ul);
    return el;
};