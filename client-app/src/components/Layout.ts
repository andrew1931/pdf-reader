import { Footer } from "./Footer";
import { Header } from "./Header";

export const Layout = (content: HTMLElement) => {
    const el = document.createElement("div");
    el.id = "layout";
    const header = Header();
    const footer = Footer(false);
    el.append(header, content, footer);
    return el;
};