import { ApiClient } from "../../api/api-client";
import { errorToString } from "../../core/utils";
import { Modal } from "../Modal";
import { ActionButton } from "../Button";

export const CheckUpdatesModal = () => {
    const wrapper = document.createElement("div");
    const description = document.createElement("span");
    description.classList.add(
        "text-sm",
        "text-slate-400",
        "mt-6"
    );

    const button = ActionButton("Okay");
    button.classList.add(
        "mx-auto",
        "mb-6"
    );
    ApiClient.getVersion()
        .then((res) => {
            if (BUILD_VERSION === res.buildHash) {
                description.innerText = "You have the latest version of PDF swiper";
                button.onclick = Modal.hide;
            } else {
                description.innerText = "New version of PDF swiper is available";
                button.innerText = "Update";
                button.onclick = () => {
                    window.location.reload();
                };
            }
        })
        .catch((error) => {
            description.innerText = errorToString(error);
        });

   
    wrapper.classList.add(
        "flex-1",
        "flex",
        "flex-col",
        "justify-between",
        "items-center"
    );
    wrapper.append(description, button);   
    Modal.show("Updates", wrapper);
};