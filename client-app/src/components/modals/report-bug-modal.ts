import { errorToString } from "../../core/utils";
import { SubmitButton } from "../Button";
import { Form, FormError, Textarea } from "../Form";
import { Modal } from "../Modal";
import { ApiClient } from "../../api/api-client";
import { Toast } from "../Toast";

export function reportBugModal() {
    const errorText = FormError();
    const button = SubmitButton("Report");
    button.classList.add("mt-4");
    const descriptionInput = Textarea({
        label: "Description",
        name: "description",
        placeholder: "Enter reproduction steps of the issue if possible ;)"
    });
    const form = Form(
        descriptionInput.target,
        button,
        errorText
    );
    form.onsubmit = (e) => {
        e.preventDefault();
        errorText.innerText = "";
        if (!descriptionInput.value()) {
            errorText.innerText = "Description field is required";
            return;
        }

        button.disabled = true;
        ApiClient.reportIssue(descriptionInput.value())
            .then((res) => {
                if (res.status !== 200) {
                    throw new Error(res.errorMessage);
                } else {
                    Modal.hide();
                    button.disabled = false;
                    Toast.success("Issue was reported, thank you for your help!");
                }
            })
            .catch((error) => {
                errorText.innerText = errorToString(error);
                button.disabled = false;
            });
    };
    Modal.show("Issue report", form);
}