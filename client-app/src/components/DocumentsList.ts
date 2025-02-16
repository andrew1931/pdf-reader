import {
    type SortOrder,
    type PaginationEvent,
    useDocumentsFetch,
    useDocumentsSort,
    usePaginationEvent,
    usePaginationRequest,
} from "../core/hooks";
import { DB, type DbFileMeta, NotInitError } from "../core/DB";
import { Toast } from "./Toast";
import { DocumentCard } from "./DocumentCard";
import { EmptyData } from "./EmptyData";

export const DocumentsList = (): HTMLElement => {
    let sorOrder: SortOrder = "DESC";
    let fetchedFiles: DbFileMeta[] = [];
    let paginationState: PaginationEvent | null = null;

    const list = document.createElement("ul");
    list.classList.add(
        "flex", 
        "flex-wrap",
        "items-center",
        "w-full"
    );

    const listWrapper = document.createElement("div");
    listWrapper.classList.add(
        "flex", 
        "items-center", 
        "justify-center",
        "w-11/12",
        "mt-6",
        "mx-auto",
        "min-h-[320px]"
    );

    const emptyList = EmptyData("You don't have any files in cache:(");
    emptyList.classList.add("mx-auto");

    const listItemCb = (item: DbFileMeta, index: number) => {
        if (paginationState) {
            if (
                index >= paginationState.offset && 
            index < paginationState.offset + paginationState.limit
            ) {
                list.appendChild(DocumentCard(item));
            }
        }
    };

    const sortByDate = (order: SortOrder) => {
        return fetchedFiles.sort((a, b) => {
            if (!a.lastViewedAt || !b.lastViewedAt) return 0;
            if (order === "ASC") {
                return a.lastViewedAt.getTime() - b.lastViewedAt.getTime();
            }
            return b.lastViewedAt.getTime() - a.lastViewedAt.getTime();
        });
    };

    function fetchDocuments() {
        console.log("fetching..", paginationState);
        if (!paginationState) return;
        DB.getAllFilesMeta()
            .then((files) => {
                fetchedFiles = files;
                listWrapper.innerHTML = "";
                if (files.length > 0) {
                    list.innerHTML = "";
                    sortByDate(sorOrder).forEach(listItemCb);
                    listWrapper.append(list);
                } else {
                    listWrapper.appendChild(emptyList);
                }
                usePaginationRequest.emit(files.length);
            })
            .catch((error) => {
                if (error instanceof NotInitError) {
                    // console.warn(error);
                } else {
                    Toast.error(error);
                }
            });
    }

    useDocumentsFetch.on(fetchDocuments);

    useDocumentsSort.on((order) => {
        sorOrder = order;
        list.innerHTML = "";
        sortByDate(sorOrder).forEach(listItemCb);
    });

    usePaginationEvent.on((res) => {
        paginationState = res;
        fetchDocuments();
    });

    return listWrapper;
};