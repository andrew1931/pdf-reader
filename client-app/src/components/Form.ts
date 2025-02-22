const MAX_INPUT_LENGTH = "1000";

const Label = (text: string, inputEl: HTMLElement, required: boolean): HTMLElement => {
    const labelMeta = document.createElement("small");
    labelMeta.classList.add( "ml-1", "opacity-80");
    labelMeta.innerText = !required ? "(optional)" : "";

    const labelText = document.createElement("div");
    labelText.innerText = text;
    labelText.classList.add(
        "label",
        "text-sm",
        "font-semibold",
        "ml-2",
        "mb-1"
    );
    labelText.appendChild(labelMeta);

    const labelEl = document.createElement("label");
    labelEl.classList.add("mt-2", "flex", "flex-col");
    if (text) {
        labelEl.appendChild(labelText); 
    }
    labelEl.appendChild(inputEl);
    return labelEl;
};

export const FormError = () => {
    const errorText = document.createElement("span");
    errorText.classList.add(
        "my-2",
        "w-full",
        "text-xs",
        "text-center",
        "text-red-500",
        "font-semibold",
    );
    return errorText;
};

export const Form = (...inputs: HTMLElement[]): HTMLFormElement => {
    const form = document.createElement("form");
    form.classList.add(
        "mt-2",
        "flex",
        "flex-col",
        "w-full",
        "overflow-hidden",
        "p-2"
    );
    form.append(...inputs);
    return form;
};

export const Input = (
    conf: {
        name?: string,
        placeholder: string,
        label?: string,
        value?: string,
        icon?: string,
        type?: string,
        required?: boolean
   }
) => {
    const input = document.createElement("input");
    input.classList.add(
        "flex-1",
        "h-full",
        "pl-9", 
        "pr-2",
        "border-none",
        "text-base", 
        "md:text-sm",
        "disabled:opacity-50",
        "rounded-[inherit]"
    );
    input.setAttribute("type", conf.type || "text");
    input.setAttribute("name", conf.name || "");
    input.setAttribute("placeholder", conf.placeholder);
    input.setAttribute("maxlength", MAX_INPUT_LENGTH);
    input.value = conf.value || "";

    const inputWrapper = document.createElement("div");
    inputWrapper.classList.add(
        "flex",
        "items-center",
        "h-11",
        "md:h-10",
        "border",
        "border-yellow-500",
        "rounded-3xl",
        "relative"
    );

    if (conf.icon) {
        const iconEl = document.createElement("span");
        iconEl.innerHTML = conf.icon;
        iconEl.classList.add("input-icon", "w-4", "left-3", "absolute");
        inputWrapper.append(iconEl);
    }

    inputWrapper.append(input);

    return {
        target: Label(conf.label || "", inputWrapper, conf.required ?? true),
        value() {
            return input.value.trim();
        },
        setValue(value: string) {
            input.value = value;
        },
        onChange(cb: (e: Event) => void) {
            input.oninput = cb;
        },
        reset() {
            input.value = "";
        },
        disable() {
            input.disabled = true;
        },
        enable() {
            input.disabled = false;
        }
    };
};

export const Textarea = (conf: {
    label: string,
    name: string,
    placeholder: string,
    required?: boolean
}) => {
    const textarea = document.createElement("textarea");
    textarea.classList.add(
        "w-full",
        "h-40", 
        "px-4", 
        "py-4",
        "resize-none",
        "border",
        "border-yellow-500",
        "rounded-3xl",
        "text-base", 
        "md:text-sm",
        "disabled:opacity-50",
    );
    textarea.setAttribute("name", conf.name);
    textarea.setAttribute("placeholder", conf.placeholder);
    textarea.setAttribute("maxlength", MAX_INPUT_LENGTH);
   
    return {
        target: Label(conf.label, textarea, conf.required ?? true),
        value() {
            return textarea.value.trim();
        },
        reset() {
            textarea.value = "";
        }
    };
};