export const ContentContainer = (...children: HTMLElement[]): HTMLElement => {
    const container = document.createElement("div");
    container.classList.add(
        "w-full",
        "px-2",
        "sm:w-11/12",
        "md:max-w-5xl",
        "mx-auto",
        "flex",
        "flex-col",
        "pt-14"
    );
    container.append(...children);
    return container;
};