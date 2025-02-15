import { ApiClient } from "../../api/api-client";
import { emailIsValid, errorToString } from "../../core/utils";
import { SubmitButton } from "../Button";
import { FormError, Input, Textarea, Form } from "../Form";
import { MailIcon } from "../icons/mail";
import { Modal } from "../Modal";
import { Toast } from "../Toast";

export const AskQuestionModal = () => {
    const errorText = FormError();
    const button = SubmitButton("Send");
    button.classList.add("mt-3");
    const emailInput = Input({
        label: "Your email",
        name: "email",
        placeholder: "Enter email",
        icon: MailIcon
    });
    const questionInput = Textarea({
        label: "Ask us a question",
        name: "question",
        placeholder: "Enter your question"
    });
    const form = Form(
        emailInput.target,
        questionInput.target,
        button,
        errorText
    );
    form.onsubmit = (e) => {
        e.preventDefault();
      
        errorText.innerText = "";
        if (!emailInput.value()) {
            errorText.innerText = "Email field is required";
            return;
        }
        if (!emailIsValid(emailInput.value())) {
            errorText.innerText = "Email field is not valid";
            return;
        }
        if (!questionInput.value()) {
            errorText.innerText = "Question field is required";
            return;
        }

        button.disabled = true;
        ApiClient.askQuestion(emailInput.value(), questionInput.value())
            .then((res) => {
                if (res.status !== 200) {
                    throw new Error(res.errorMessage);
                } else {
                    Modal.hide();
                    button.disabled = false;
                    emailInput.reset();
                    questionInput.reset();
                    Toast.success("Question was asked, we will answer you ASAP");
                }
            })
            .catch((error) => {
                errorText.innerText = errorToString(error);
                button.disabled = false;
            });
    };
    Modal.show("Contact us", form);
};