import { ApiClient } from "../../api/api-client";
import { errorToString } from "../../core/utils";
import { Modal } from "../Modal";

export const PolicyModal = () => {
    const text = document.createElement("p");
    text.classList.add("policy-text", "whitespace-break-spaces", "text-sm");
    ApiClient.getPolicy()
        .then((res) => {
            text.innerHTML = errorToString(res);
        })
        .catch((error) => {
            text.innerHTML = errorToString(error);
        });
    Modal.show("Privacy policy", text);
};