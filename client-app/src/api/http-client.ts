import { LS } from "../core/LS";

export const HttpClient = (baseUrl: string) => {
    const headers = (): Headers => {
        const header = new Headers();
        const token = LS.getToken();
        if (typeof token === "string") {
            header.append("Authorization", `Bearer ${token}`);
        }
        return header;
    };

    return {
        getLocal(path: string) {
            return fetch(path)
                .then((res) => {
                    if (path.endsWith(".json")) {
                        return res.json();
                    }
                    return res.text();
                });
        },
        get(path: string) {
            return fetch(
                `${baseUrl}/${path}`,
                { headers: headers() }
            )
                .then((res) => res.json());
        },
        post(path: string, body: unknown) {
            return fetch(
                `${baseUrl}/${path}`,
                { 
                    method: "post",
                    body: JSON.stringify(body),
                    headers: headers(),
                }
            )
                .then((res) => res.json());
        },
        streamFormData(path: string, formData: FormData) {
            return fetch(
                `${baseUrl}/${path}`,
                { 
                    method: "post",
                    body: formData,
                    headers: headers(),
                }
            );
        },
        stream(path: string, body: unknown) {
            return fetch(
                `${baseUrl}/${path}`,
                { 
                    method: "post",
                    body: JSON.stringify(body),
                    headers: headers()
                });
        }
    };
};