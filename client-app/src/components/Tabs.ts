import { useWindowResize } from "../core/hooks";
import {
    getSearchParam,
    updateSearchParams,
    useNavigationEnter,
    useQueryParamsChange
} from "../core/router";

export type Tab = {
    label: string;
    param: string;
};

export const Tabs = (tabList: Tab[], paramKey = "") => {
    const subscribers: ((value: string) => void)[] = [];
    let activeLocalTab = tabList[0].param;
    const useUrl = paramKey.length > 0;
    const offsetPx = 3;
    const tabWidth = "w-36";
    const tabs = document.createElement("ul");
    tabs.classList.add(
        "tabs",
        "flex",
        "justify-center",
        "relative",
        "rounded-3xl",
        "mt-4",
        "mx-auto",
        "md:mx-auto",
        "md:mx-2",
        "px-[3px]",
        "overflow-hidden",
    );

    const activeIndicator = document.createElement("div");
    activeIndicator.classList.add(
        "tabs-active",
        "rounded-3xl",
        "absolute",
        "bottom-[3px]",
        "transition-[left]",
        "h-[38px]",
        tabWidth
    );

    const tabItem = (item: Tab) => {
        const li = document.createElement("button");
        li.classList.add(
            "py-2",
            "px-4",
            "text-sm",
            "font-medium",
            "border-b-2",
            "border-transparent",
            "leading-loose",
            "z-10",
            "break-words",
            "overflow-hidden",
            "h-[44px]",
            tabWidth,
        );
      
        li.innerText = item.label;
        li.onclick = () => {
            activeLocalTab = item.param;
            if (useUrl) {
                updateSearchParams(paramKey, item.param);
            } else {
                setActiveTabStyle(activeLocalTab);
            }
            subscribers.forEach((cb) => cb(activeLocalTab));
            li.blur();
        };
        return li;
    };

    const tabItems = tabList.map((tab) => tabItem(tab));
    tabs.append(
        activeIndicator,
        ...tabItems,
    );
   
    function setActiveTabStyle(activeTab: string) {
        if (!activeTab) return;
        const targetIndex = tabList.findIndex((el) => el.param === activeTab);
        if (targetIndex !== -1) {
            activeIndicator.style.left = (activeIndicator.clientWidth * targetIndex) + offsetPx  + "px";
            tabItems.forEach((item, index) => {
                if (index === targetIndex) {
                    item.classList.add("active-tab");
                } else {
                    item.classList.remove("active-tab");
                }
            });
        }
    }

    function handleParams() {
        const activeTab = getSearchParam(paramKey);
        if (activeTab) {
            setActiveTabStyle(activeTab);
        } else {
            updateSearchParams(paramKey, tabList[0].param);
        }
    }

    useNavigationEnter(() => {
        if (useUrl) {
            handleParams();
        } else {
            setActiveTabStyle(activeLocalTab);
        }
    });
   
    useQueryParamsChange(() => {
        if (useUrl) {
            handleParams();
        }
    });

    useWindowResize.on(() => {
        if (useUrl) {
            const activeTab = getSearchParam(paramKey);
            if (activeTab) {
                setActiveTabStyle(activeTab);
            }   
        } else {
            setActiveTabStyle(activeLocalTab);
        }
    });

    return {
        target: tabs,
        onChange(cb: (val: string) => void) {
            subscribers.push(cb);
        }
    };
};