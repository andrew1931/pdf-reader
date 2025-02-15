export const Range = (label: string, min: number, max: number, current: number) => {
    const labelEl = document.createElement("div");
    labelEl.classList.add("disable-dbl-tap-zoom", "w-full", "flex", "justify-between", "my-2");
   
    const labelText = document.createElement("span");
    labelText.innerText = label + ": " + current;
    labelText.classList.add("font-medium", "text-xs");

    const rangeVisibleKnob = document.createElement("div");
    rangeVisibleKnob.classList.add(
        "knob",
        "w-5",
        "h-5",
        "rounded-full",
        "bg-blue-500",
        "absolute",
        "-right-[2px]",
        "-top-[7px]"
    );

    const rangeVisibleBody = document.createElement("div");
    rangeVisibleBody.classList.add(
        "w-full",
        "h-1",
        "bg-slate-300",
        "cursor-pointer",
        "rounded-full",
    );

    const rangeVisibleBodyFilled = document.createElement("div");
    rangeVisibleBodyFilled.classList.add(
        "h-1",
        "bg-blue-500",
        "absolute",
        "left-0",
        "top-0",
        // "transition-[width]",
        // "duration-75",
        "rounded-full",
    );

    rangeVisibleBodyFilled.appendChild(rangeVisibleKnob);

    const rangeVisible = document.createElement("div");
    rangeVisible.classList.add(
        "absolute",
        "z-0",
        "w-full",
    );
    rangeVisible.append(rangeVisibleBody, rangeVisibleBodyFilled);

    const rangeHidden = document.createElement("input");
    rangeHidden.setAttribute("type", "range");
    rangeHidden.setAttribute("step", "any");
    rangeHidden.setAttribute("min", String(min));
    rangeHidden.setAttribute("max", String(max));
    rangeHidden.value = String(current);
    rangeHidden.classList.add(
        "opacity-0",
        "z-10",
        "absolute",
        "w-full",
        "cursor-pointer",
        "absolute",
        "left-0",
        "-top-[16px]",
        "h-10"
    );
    rangeHidden.oninput = () => {
        labelText.innerText = label + ": " + rangeValue();
        rangeVisibleBodyFilled.style.width = calcValuePercent() + "%";
    };
    rangeVisibleBodyFilled.style.width = calcValuePercent() + "%";

    const rangeWrapper = document.createElement("div");
    rangeWrapper.classList.add(
        "relative",
        "w-52",
        "my-2"
    );
    rangeWrapper.append(rangeHidden, rangeVisible);

    function calcValuePercent(): number {
        return (Number(rangeHidden.value) * 100) / max;
    }

    function rangeValue(): number {
        return Math.floor(Number(rangeHidden.value));
    }

    labelEl.append(labelText, rangeWrapper);
    return {
        target: labelEl,
        onChange(cb: (page: number) => void): void {
            rangeHidden.onchange = () => cb(rangeValue());
        }
    };
};