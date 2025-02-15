import { ApiClient } from "../../api/api-client";
import { errorToString } from "../../core/utils";
import { Modal } from "../Modal";

export const PolicyModal = () => {
    const text = document.createElement("p");
    ApiClient.getPolicy()
        .then((res) => {
            text.innerHTML = errorToString(res);
        })
        .catch((error) => {
            text.innerHTML = errorToString(error);
        });
    Modal.show("Our policy", text);
};