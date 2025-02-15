import { useDocumentPageChange } from "../../core/hooks";
import { ThemeToggle } from "../Settings/ThemeToggle";
import { Range } from "../Range";

export const ReadingSettings = ({ numberOfPages, currentPage }) => {
    const settings = document.createElement("div");
    settings.classList.add(
        "flex",
        "flex-col",
        "w-full",
    );

    const page = Range("Current page", 1, numberOfPages, currentPage);
    page.onChange(useDocumentPageChange.emit);

    settings.append(
        ThemeToggle(),
        page.target,
    );

    return settings;
};