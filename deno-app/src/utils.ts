export const errorToString = (error: unknown): string => {
    let errorText = "Oops, something went wrong";
    if (typeof error === "string") {
        errorText = error;
    } else if (error instanceof Error) {
        errorText = error.message;
    }
    return errorText;
};

export const steamResponse = (data: unknown, status: number) => {
    return new TextEncoder().encode(
        JSON.stringify({ data, status }) + " \n"
    )
};

export const strToBool = (val: string): boolean => {
    if (val === "true") return true;
    if (val === "false") return false;
    return Boolean(val);
};