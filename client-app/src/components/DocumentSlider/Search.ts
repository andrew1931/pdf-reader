import { useDocumentPageChange } from "../../core/hooks";
import { type PdfParsedDocument, type DocumentText } from "../../pdf-reader";
import { SubmitButton } from "../Button";
import { Form, Input } from "../Form";
import { SearchIcon } from "../icons/search";
import { Modal } from "../Modal";

const renderSearchList = (
    list: HTMLUListElement,
    listItems: DocumentText,
    searchVal: RegExp
) => {
    list.innerHTML = "";
    if (listItems.length === 0) {
        const emptyResult = document.createElement("div");
        emptyResult.classList.add(
            "w-full",
            "text-sm",
            "font-semibold",
            "text-center"
        );
        emptyResult.innerText = "Nothing found for your search :(";
        list.appendChild(emptyResult);
        return;
    }
    listItems.forEach((el) => {
        const text = document.createElement("span");
        text.classList.add(
            "text-xs",
            "w-10/12",
            "break-words",
        );
        text.innerHTML = "page " + `<b>${el.pageNumber}</b>` + ": " +
            el.text.replace(searchVal, `<b class="text-yellow-500">${searchVal.source}</b>`);

        const listButton = document.createElement("button");
        listButton.classList.add(
            "flex",
            "justify-between",
            "items-center",
            "px-2",
            "py-3",
            "w-full",
            "text-left",
            "shadow-card"
        );
        listButton.onclick = () => {
            useDocumentPageChange.emit(el.pageNumber);
            Modal.hide();
        };
        listButton.append(text);

        const li = document.createElement("li");
        li.appendChild(listButton);
        list.appendChild(li);
    });
};


export const Search = (pdf: PdfParsedDocument): HTMLElement => {
    const BUTTON_INITIAL_TEXT = "Search";
    const BUTTON_LOADING_TEXT = "Searching...";
    let documentText: DocumentText = [];

    const list = document.createElement("ul");
    list.classList.add("list", "mb-2");

    const button = SubmitButton(BUTTON_INITIAL_TEXT);
    button.classList.add("mt-2");

    const searchInput = Input({
        label: "Search in document",
        name: "search",
        placeholder: "Search",
        icon: SearchIcon,
    });
    const form = Form(
        searchInput.target,
        button
    );

    const applySearch = (searchVal: string) => {
        if (searchVal.length > 0) {
            const regExp = new RegExp(searchVal, "i");
            const results = documentText.filter((page) => regExp.test(page.text));
            renderSearchList(list, results, regExp);
        } else {
            list.innerHTML = "";
        }
        button.innerText = BUTTON_INITIAL_TEXT;
    };

    form.onsubmit = (e) => {
        e.preventDefault();
        button.innerText = BUTTON_LOADING_TEXT;
        const searchVal = searchInput.value();
        if (searchVal.length > 0) {
            if (documentText.length === 0) {
                pdf.getDocumentText()
                    .then((res) => documentText = res)
                    .then(() => applySearch(searchVal));
            } else {
                applySearch(searchVal);
            }
        } else {
            applySearch("");
        }
    };

    const wrapper = document.createElement("div");
    wrapper.append(form, list);

    return wrapper;
};