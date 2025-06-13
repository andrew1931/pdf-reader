import { ApiClient } from '../../api/api-client';
import { emailIsValid, errorToString } from '../../core/utils';
import { SubmitButton, ActionButton } from '../Button';
import { Form, FormError } from '../Form';
import { Toast } from '../Toast';
import { codeInput, emailInput, passInput } from './utils';

export const ResetPasswordForm = (onSuccessCb: () => void) => {
   let checkedEmail = '';

   const email = emailInput();
   const password = passInput('New password');
   const code = codeInput();
   const submitButton = SubmitButton('Submit');
   const firstStepButton = ActionButton('Back');

   const errorText = FormError();
   errorText.classList.add('inline-block', 'mt-4');

   const buttonsWrapper = document.createElement('div');
   buttonsWrapper.classList.add('flex', 'justify-between', 'mt-4', 'ml-auto');
   buttonsWrapper.append(firstStepButton, submitButton);

   const form = Form(email.target, password.target, code.target, buttonsWrapper, errorText);

   function handleError(error: unknown) {
      console.error(error);
      submitButton.disabled = false;
      errorText.innerText = errorToString(error);
   }

   function startSubmit() {
      errorText.innerText = '';
      submitButton.disabled = true;
   }

   function firstStep() {
      firstStepButton.classList.add('hidden');
      code.target.classList.add('hidden');
      password.target.classList.add('hidden');
      email.target.classList.remove('hidden');
      buttonsWrapper.classList.remove('w-full');
      checkedEmail = '';
   }

   function secondStep() {
      firstStepButton.classList.remove('hidden');
      code.target.classList.remove('hidden');
      password.target.classList.remove('hidden');
      email.target.classList.add('hidden');
      buttonsWrapper.classList.add('w-full');
      checkedEmail = email.value();
   }

   firstStepButton.onclick = () => {
      firstStep();
      code.reset();
      password.reset();
   };

   form.onsubmit = (e) => {
      e.preventDefault();

      if (!checkedEmail) {
         if (!email.value()) {
            errorText.innerText = 'Email field is required';
            return;
         }

         if (!emailIsValid(email.value())) {
            errorText.innerText = 'Email field is not valid';
            return;
         }

         startSubmit();
         ApiClient.emailExists(email.value())
            .then((res) => {
               if (res.status !== 200) {
                  throw new Error(res.errorMessage);
               } else {
                  if (!res.data) {
                     secondStep();
                     submitButton.disabled = false;
                     Toast.success('Code was sent to email: ' + email.value());
                  } else {
                     throw new Error('There is no account with email ' + email.value());
                  }
               }
            })
            .catch(handleError);
      } else {
         if (!password.value()) {
            errorText.innerText = 'Password field is required';
            return;
         }

         if (!code.value()) {
            errorText.innerText = 'Code field is required';
            return;
         }

         startSubmit();
         ApiClient.resetPassword(checkedEmail, password.value(), code.value())
            .then((res) => {
               if (res.status !== 200) {
                  throw new Error(res.errorMessage);
               } else {
                  form.reset();
                  submitButton.disabled = false;
                  Toast.success('Your password was changed');
                  onSuccessCb();
               }
            })
            .catch(handleError);
      }
   };

   return {
      target: form,
      reset() {
         email.enable();
         email.reset();
         password.reset();
         code.reset();
         submitButton.disabled = false;
         errorText.innerText = '';
         firstStep();
      },
      fillOutEmail(emailVal: string) {
         email.setValue(emailVal);
         email.disable();
      },
   };
};
