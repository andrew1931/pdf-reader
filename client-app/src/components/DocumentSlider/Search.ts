import { useDocumentPageChange } from "../../core/hooks";
import { debounce } from "../../core/utils";
import { type DocumentText } from "../../pdf-reader";
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
            "text-center",
            "mt-4"
        );
        emptyResult.innerText = "Nothing found for your search string :(";
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


export const Search = (searchHandlerFn: () => Promise<DocumentText>): HTMLElement => {
    let documentText: DocumentText = [];

    const list = document.createElement("ul");
    list.classList.add("list", "mb-2");

    const searchInput = Input({
        placeholder: "Search string...",
        icon: SearchIcon,
        label: "Search in document"
    });
    searchInput.target.classList.add("mb-2");
    const form = Form(searchInput.target);

    const applySearch = (searchVal: string) => {
        if (searchVal.length > 0) {
            const regExp = new RegExp(searchVal, "ig");
            const results = documentText.filter((page) => regExp.test(page.text));
            renderSearchList(list, results, regExp);
        } else {
            list.innerHTML = "";
        }
    };

    const searchHandler = debounce(() => {
        const searchVal = searchInput.value();
        if (searchVal.length > 0) {
            searchHandlerFn()
                .then((res) => documentText = res)
                .then(() => applySearch(searchVal));
        } else {
            applySearch("");
        }
    }, 500);

    searchInput.target.oninput = searchHandler;

    form.onsubmit = (e) => {
        e.preventDefault();
        searchHandler();
    };

    const wrapper = document.createElement("div");
    wrapper.append(form, list);

    return wrapper;
};