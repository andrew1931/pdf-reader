export const errorToString = (error: unknown): string => {
    let errorText = "Oops, something went wrong";
    if (typeof error === "string") {
        errorText = error;
    } else if (error instanceof Error) {
        errorText = error.message;
    }
    return errorText;
};

export const bytesToMb = (bytes: number): string => {
    if (!bytes) return "0";
    return (bytes / Math.pow(1024, 2)).toFixed(1);
};

const emailRegExp = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

export const emailIsValid = (email: string) => {
    return emailRegExp.test(email);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const debounce = (callback: (...args: any[]) => void, wait = 0) => {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            callback.apply(this, args);
        }, wait);
    };
};

export const objectToQueryString = (props: Record<string, string | number>): string => {
    const queryParams = new URLSearchParams();
    Object.keys(props).forEach((key) => {
        queryParams.append(key, encodeURIComponent(props[key]));
    });
    return "?" + queryParams.toString();
};

export const isTouchDevice = () => "ontouchstart" in window || navigator.maxTouchPoints > 0;

export const html = () => document.querySelector("html") as HTMLElement;