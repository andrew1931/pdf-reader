export type SettingsActionButton = {
    label: string;
    labelInfo?: HTMLElement;
    icon: string;
    iconColor: string;
    action: () => void;
};

export const SettingButton = (item: SettingsActionButton) => {
    const iconEl = document.createElement("span");
    iconEl.classList.add("w-5", "mr-4", item.iconColor);
    iconEl.innerHTML = item.icon;
    const labelEl = document.createElement("span");
    labelEl.innerText = item.label;

    const link = document.createElement("button");
    link.classList.add(
        "card",
        "w-full",
        "flex",
        "items-center",
        "shadow-card",
        "rounded-full",
        "font-medium",
        "text-base",
        "py-2",
        "px-4",
        "my-2",
        "cursor-pointer"
    );

    link.onclick = (e) => {
        e.preventDefault();
        item.action();
        link.blur();
    };

    link.append(iconEl, labelEl);
    if (item.labelInfo) {
        link.appendChild(item.labelInfo);
    }

    return link;
};