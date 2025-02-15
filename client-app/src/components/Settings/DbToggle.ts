import { DB } from "../../core/DB";
import { Toggle } from "../Toggle";

export const DbToggle = () => {
    const label = document.createElement("div");
    label.classList.add(
        "w-full",
        "flex",
        "items-center",
        "justify-between",
        "text-slate-400",
        "font-medium",
        "text-sm",
        "my-4"
    );
    const text = document.createElement("span");
    text.innerText = "Enable files cache";
    const toggle = Toggle(!DB.isDisabled());
    toggle.onChange((val) => {
        if (val) {
            DB.enable();
        } else {
            DB.disable();
        }      
    });
    label.append(text, toggle.target);
    return label;
};