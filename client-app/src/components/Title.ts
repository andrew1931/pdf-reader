
export const H1 = (text: string): HTMLHeadingElement => {
    const title = document.createElement("h1");
    title.classList.add(
        "title",
        "text-3xl",
        "text-center",
        "md:text-5xl",
        "mb-3",
        "md:mb-5",
    );
    title.innerText = text;
    return title;
};

export const P = (text: string): HTMLHeadingElement => {
    const title = document.createElement("p");
    title.classList.add(
        "subtitle",
        "text-center",
        "text-base",
        "md:text-xl",
        "max-w-md",
        "mx-auto",
        "mb-3"
    );
    title.innerText = text;
    return title;
};
