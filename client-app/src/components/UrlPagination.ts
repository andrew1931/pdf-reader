import { usePageUpdate, usePaginationEvent, usePaginationRequest } from "../core/hooks";
import {
    updateSearchParams,
    getSearchParam,
    useNavigationEnter,
    useQueryParamsChange
} from "../core/router";
import { ActionButtonSm } from "./Button";


export const PAGE_SIZE = 12;

export const UrlPagination = (
    dependencyParams: Array<[string, string]> = []
): HTMLElement => {
    const el = document.createElement("div");
    el.classList.add(
        "flex",
        "flex-col",
        "items-center",
        "justify-between",
        "my-2"
    );

    const info = document.createElement("p");
    info.classList.add(
        "text-xs",
        "text-slate-500",
        "px-2",
        "mb-3",
    );

    const BoldText = (text: string | number): HTMLElement => {
        const el = document.createElement("span");
        el.classList.add("font-semibold");
        el.innerText = String(text);
        return el;
    };
    const infoText = (page: number, total: number) => {
        info.innerHTML = "";
        info.append(
            "Showing page ",
            BoldText(page),
            " out of ",
            BoldText(total)
        );
    };

    const prevButton = ActionButtonSm("Previous");
    const nextButton = ActionButtonSm("Next");

    const buttonsWrapper = document.createElement("div");
    buttonsWrapper.append(prevButton, nextButton);
   
    const PAGE_SIZE = 12;
    const MIN_PAGE = 1;

    const getPage = () => parseInt(getSearchParam("page"));

    const getOffset = () => (getPage() - 1) * PAGE_SIZE;

    function handleSearchParams() {
        const page = getPage();
        if (!page || page < MIN_PAGE) {
            updateSearchParams("page", String(MIN_PAGE));
        } else {
            let shouldUpdate = dependencyParams.length === 0;
            for (const params of dependencyParams) {
                if (getSearchParam(params[0]) === params[1]) {
                    shouldUpdate = true;
                }
            }
            if (shouldUpdate) {
                usePaginationEvent.emit({ limit: PAGE_SIZE, offset: getOffset() });
            }
        }
    }

    useNavigationEnter(() => {
        handleSearchParams();
    });

    useQueryParamsChange(() => {
        handleSearchParams();
    });

    let maxItems = PAGE_SIZE;

    usePaginationRequest.on((data) => {
        maxItems = data;
        const maxNumberOfPages = Math.ceil(maxItems / PAGE_SIZE);
        if (maxItems === 0) {
            el.innerHTML = "";
        } else if (getPage() > maxNumberOfPages) {
            updateSearchParams("page", String(maxNumberOfPages));
        } else {
            if (maxNumberOfPages > MIN_PAGE) {
                el.append(info, buttonsWrapper);
                nextButton.disabled = getOffset() + PAGE_SIZE >= maxItems;
                prevButton.disabled = getOffset() === 0;
                infoText(getPage(), maxNumberOfPages);
            } else {
                el.innerHTML = "";
            }
        }
    });

    usePageUpdate.on(handleSearchParams);

    prevButton.onclick = () => {
        if (getPage() > MIN_PAGE) {
            prevButton.disabled = true;
            updateSearchParams("page", String(getPage() - 1));
        }
    };

    nextButton.onclick = () => {
        if (getOffset() + PAGE_SIZE < maxItems) {
            nextButton.disabled = true;
            updateSearchParams("page", String(getPage() + 1));
        }
    };
   
    return el;
};