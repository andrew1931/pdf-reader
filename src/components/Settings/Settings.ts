import { DB } from "../../core/DB";
import { useDbInit } from "../../core/hooks";
import { useNavigationEnter } from "../../core/router";
import { bytesToMb } from "../../core/utils";
import { UserIcon } from "../icons/user";
import { settingsButtons } from "./buttons-definition";
import { DbToggle } from "./DbToggle";
import { ThemeToggle } from "./ThemeToggle";

export const Settings = () => {
    const wrapper = document.createElement("div");
    wrapper.classList.add(
        "text-center",
        "text-zinc-500",
        "text-base",
        "md:text-xl",
        "w-full",
        "max-w-xl",
        "mx-auto",
        "mt-3",
        "mb-10",
        "rounded-md",
        "p-4"
    );

    const userEmailInfo = (email: string) => {
        const iconEl = document.createElement("span");
        iconEl.classList.add("w-6", "mr-2", "text-green-500");
        iconEl.innerHTML = UserIcon;

        const textEl = document.createElement("span");
        textEl.classList.add(
            "max-w-[90%]",
            "text-ellipsis",
            "overflow-hidden",
            "whitespace-nowrap"
        );
        textEl.innerText = email;

        const el = document.createElement("div");
        el.classList.add(
            "title",
            "flex",
            "font-medium",
            "text-base",
            "md:text-xl",
            "my-6",
            "justify-center",
            "align-center"
        );
        el.append(iconEl, textEl);
        return el;
    };

    const usedStorageEl = document.createElement("span");
    usedStorageEl.classList.add(
        "ml-2",
        "text-slate-400",
        "text-xs",
        "overflow-hidden",
        "text-ellipsis",
        "whitespace-nowrap",
        "max-w-[50%]",
        "md:max-w-[70%]",
    );

    const themeToggle = ThemeToggle();

    useDbInit.on(updateStorageInfo);

    useNavigationEnter(() => {
        updateStorageInfo();
        themeToggle.update();
    });

    function updateStorageInfo() {
        DB.getUsedSize()
            .then((size) => {
                usedStorageEl.innerText = "(" + bytesToMb(size) + "mb)";
            });
    }

    return () => {
        wrapper.innerHTML = "";
        wrapper.append(
            userEmailInfo("Anonym guest"),
            themeToggle.target,
            DbToggle(),
            settingsButtons.storage(usedStorageEl),
            settingsButtons.question,
            settingsButtons.report,
            settingsButtons.info,
            settingsButtons.updates,
        );

        return wrapper;
    };
};
