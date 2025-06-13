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

    const button = document.createElement("button");
    button.setAttribute("aria-label", item.label);
    button.classList.add(
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

    button.onclick = (e) => {
        e.preventDefault();
        item.action();
        button.blur();
    };

    button.append(iconEl, labelEl);
    if (item.labelInfo) {
        button.appendChild(item.labelInfo);
    }
    return button;
};