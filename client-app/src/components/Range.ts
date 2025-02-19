export const Range = (min: number, max: number, current: number) => {
    const labelEl = document.createElement("div");
    labelEl.classList.add(
        "disable-dbl-tap-zoom",
        "w-full",
        "flex",
        "flex-col",
        "justify-center",
        "items-center",
        "my-2"
    );

    const labelTextValue = () => rangeValue() + " out of " + max;

    const rangeVisibleBody = document.createElement("div");
    rangeVisibleBody.classList.add(
        "w-full",
        "h-full",
        "bg-slate-400",
        "cursor-pointer",
    );

    const rangeVisibleBodyFilled = document.createElement("div");
    rangeVisibleBodyFilled.classList.add(
        "h-full",
        "bg-blue-500",
        "absolute",
        "left-0",
        "top-0",
    );

    const rangeVisible = document.createElement("div");
    rangeVisible.classList.add(
        "absolute",
        "z-0",
        "w-full",
        "h-full",
        "rounded-md",
        "overflow-hidden"
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
        "h-full",
    );

    const labelText = document.createElement("span");
    labelText.classList.add(
        "font-medium",
        "text-xs",
        "text-white",
        "absolute",
        "z-10",
    );

    function mapInputValueToVisibleRange() {
        labelText.innerText = labelTextValue();
        rangeVisibleBodyFilled.style.width = calcValuePercent() + "%";
    }

    rangeHidden.oninput = mapInputValueToVisibleRange;
    
    mapInputValueToVisibleRange();

    const rangeWrapper = document.createElement("div");
    rangeWrapper.classList.add(
        "relative",
        "w-52",
        "h-[30px]",
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
            rangeHidden.onchange = () => {
                const floorValue = rangeValue();
                rangeHidden.value = String(floorValue);
                mapInputValueToVisibleRange(); 
                cb(floorValue);
            };
        },
        update(val: number) {
            if (val !== Math.floor(+rangeHidden.value)) {
                rangeHidden.value = String(val);
                mapInputValueToVisibleRange();
            }
        }
    };
};