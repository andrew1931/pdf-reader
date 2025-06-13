import { ApiClient } from "../../api/api-client";
import { navigate } from "../../core/router";
import { LS } from "../../core/LS";
import { emailIsValid, errorToString } from "../../core/utils";
import { routes } from "../../routes.definition";
import { SubmitButton, ActionButton } from "../Button";
import { Form, FormError } from "../Form";
import { Toast } from "../Toast";
import { codeInput, emailInput, passInput } from "./utils";


export const SignUpForm = () => {
    let checkedEmail = "";
    let checkedPassword = "";

    const signUpEmailInput = emailInput();
    const signUpPassInput = passInput();
    const signUpCodeInput = codeInput();
    const signUpButton = SubmitButton("Submit");
    const firstStepButton = ActionButton("Back");

    const errorText = FormError();
    errorText.classList.add("inline-block", "mt-4");

    const buttonsWrapper = document.createElement("div");
    buttonsWrapper.classList.add("flex", "justify-between", "mt-4", "ml-auto");
    buttonsWrapper.append(firstStepButton, signUpButton);

    const signUpForm = Form(
        signUpEmailInput.target,
        signUpPassInput.target,
        signUpCodeInput.target,
        buttonsWrapper,
        errorText
    );

    function handleError(error:  unknown) {
        console.error(error);
        signUpButton.disabled = false;
        errorText.innerText = errorToString(error);
    }

    function startSubmit() {
        errorText.innerText = "";
        signUpButton.disabled = true;
    }

    function firstStep() {
        firstStepButton.classList.add("hidden");
        signUpCodeInput.target.classList.add("hidden");
        signUpEmailInput.target.classList.remove("hidden");
        signUpPassInput.target.classList.remove("hidden");
        buttonsWrapper.classList.remove("w-full");
        checkedEmail = "";
        checkedPassword = "";
    }

    function secondStep() {
        firstStepButton.classList.remove("hidden");
        signUpCodeInput.target.classList.remove("hidden");
        signUpEmailInput.target.classList.add("hidden");
        signUpPassInput.target.classList.add("hidden");
        buttonsWrapper.classList.add("w-full");
        checkedEmail = signUpEmailInput.value();
        checkedPassword = signUpPassInput.value();
    }

    firstStepButton.onclick = () => {
        firstStep();
        signUpCodeInput.reset();
    };

    signUpForm.onsubmit = (e) => {
        e.preventDefault();

        if (!checkedEmail || !checkedPassword) {
            if (!signUpEmailInput.value() || !signUpPassInput.value()) {
                errorText.innerText = "Both fields are required";
                return;
            }
   
            if (!emailIsValid(signUpEmailInput.value())) {
                errorText.innerText = "Email field is not valid";
                return;
            }

            startSubmit();
            ApiClient.emailExists(signUpEmailInput.value())
                .then((res) => {
                    if (res.status !== 200) {
                        throw new Error(res.errorMessage);
                    } else {
                        if (res.data) {
                            Toast.success("Code was sent to email: " + signUpEmailInput.value());
                            secondStep();
                            signUpButton.disabled = false;
                        } else {
                            throw new Error("Email is already being used");
                        }
                    }
                })
                .catch(handleError);
        } else {

            if (!signUpCodeInput.value()) {
                errorText.innerText = "Code field is required";
                return;
            }

            startSubmit();
            ApiClient.signUp(
                checkedEmail,
                checkedPassword,
                signUpCodeInput.value()
            )
                .then((res) => {
                    if (res.status !== 200) {
                        throw new Error(res.errorMessage);
                    } else {
                        LS.saveToken(res.data.token);
                        LS.saveUser(res.data.user);
                        signUpForm.reset();
                        signUpButton.disabled = false;
                        Toast.success("Your account was created");
                        navigate(routes.home.pathname);
                    }
                })
                .catch(handleError);
        }
    };

    return {
        target: signUpForm,
        reset() {
            signUpEmailInput.reset();
            signUpPassInput.reset();
            signUpCodeInput.reset();
            signUpButton.disabled = false;
            errorText.innerText = "";
            firstStep();
        }
    };
};