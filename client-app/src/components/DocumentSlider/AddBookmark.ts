import { DB, type DbFileMeta } from "../../core/DB";
import { useDocumentPageChange } from "../../core/hooks";
import { SubmitButton } from "../Button";
import { Form, FormError, Input } from "../Form";
import { DeleteIcon } from "../icons/delete";
import { Modal } from "../Modal";
import { Toast } from "../Toast";

const BookmarksList = (
    bookmarks: DbFileMeta["bookmarks"],
    fileName: string,
    updateListData: () => void
) => {
    const list = document.createElement("ul");
    list.classList.add("bookmarks-list");

    const renderList = (bookmarks: DbFileMeta["bookmarks"]) => {
        list.innerHTML = "";
        bookmarks.forEach((el, index) => {
            const text = document.createElement("span");
            text.classList.add(
                "text-xs",
                "w-10/12",
                "break-words",
            );
            text.innerText = el.note;

            const removeButton = document.createElement("button");
            removeButton.setAttribute("aria-label", "Remove bookmark");
            removeButton.innerHTML = DeleteIcon;
            removeButton.classList.add("btn-icon", "w-12", "px-4", "py-2");
            removeButton.onclick = (e) => {
                e.stopPropagation();
                const newBookmarks = [...bookmarks];
                newBookmarks.splice(index, 1);
                DB.editFileMeta(fileName, { bookmarks: newBookmarks })
                    .then(updateListData)
                    .catch(Toast.error);
            };

            const listButton = document.createElement("button");
            listButton.classList.add(
                "flex",
                "justify-between",
                "items-center",
                "p-2",
                "w-full",
                "text-left",
            );
            listButton.onclick = () => {
                useDocumentPageChange.emit(el.page);
                Modal.hide();
            };
            listButton.append(text, removeButton);

            const li = document.createElement("li");
            li.appendChild(listButton);
            list.prepend(li);
        });
    };

    renderList(bookmarks);

    return {
        target: list,
        update(bookmarks: DbFileMeta["bookmarks"]) {
            renderList(bookmarks);
        }
    };
};

export const AddBookmark = (fileName: string, currentPage: number): HTMLElement => {
    let bookmarks: DbFileMeta["bookmarks"] = [];

    const errorText = FormError();
    const button = SubmitButton("Add");
    button.classList.add("mt-3");

    const bookmarksList = BookmarksList(bookmarks, fileName, updateListData);   
    
    const bookmarkInput = Input({
        label: "Add a bookmark note",
        name: "bookmark",
        placeholder: "Enter a note",
        required: false
    });
    const form = Form(
        bookmarkInput.target,
        button,
        errorText
    );
    form.onsubmit = (e) => {
        e.preventDefault();
        errorText.innerText = "";
        const bookmark = {
            page: currentPage,
            note: bookmarkInput.value() || "page " + currentPage
        };
        bookmarks = [...bookmarks, bookmark];
        DB.editFileMeta(fileName, { bookmarks })
            .then(() => {
                bookmarksList.update(bookmarks);
                form.reset();
            })
            .catch(Toast.error);
    };

    const wrapper = document.createElement("div");
    wrapper.append(form, bookmarksList.target);

    function updateListData() {
        DB.getFileMeta(fileName)
            .then((res) => {
                if (res.bookmarks && Array.isArray(res.bookmarks)) {
                    bookmarks = res.bookmarks;
                } else {
                    bookmarks = [];
                }
                bookmarksList.update(bookmarks);
            })
            .catch((error) => {
                Toast.error(error);
            });
    }

    updateListData();

    return wrapper;
};