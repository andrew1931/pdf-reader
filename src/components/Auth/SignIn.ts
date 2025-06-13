import { Form, FormError } from '../Form';
import { emailIsValid, errorToString } from '../../core/utils';
import { ApiClient } from '../../api/api-client';
import { navigate } from '../../core/router';
import { routes } from '../../routes.definition';
import { emailInput, passInput } from './utils';
import { SubmitButton } from '../Button';
import { Toast } from '../Toast';
import { LS } from '../../core/LS';

export const SignInForm = () => {
   const signInEmailInput = emailInput();
   const signInPassInput = passInput();
   const signInButton = SubmitButton('Submit');
   signInButton.classList.add('mt-4');

   const errorText = FormError();
   errorText.classList.add('inline-block', 'mt-4');

   const signInForm = Form(
      signInEmailInput.target,
      signInPassInput.target,
      signInButton,
      errorText
   );

   function handleError(error: unknown) {
      console.error(error);
      signInButton.disabled = false;
      errorText.innerText = errorToString(error);
   }

   function startSubmit() {
      errorText.innerText = '';
      signInButton.disabled = true;
   }

   signInForm.onsubmit = (e) => {
      e.preventDefault();

      if (!signInEmailInput.value() || !signInPassInput.value()) {
         errorText.innerText = 'Both fields are required';
         return;
      }

      if (!emailIsValid(signInEmailInput.value())) {
         errorText.innerText = 'Email field is not valid';
         return;
      }

      startSubmit();

      ApiClient.signIn(signInEmailInput.value(), signInPassInput.value())
         .then((res) => {
            if (res.status !== 200) {
               throw new Error(res.errorMessage);
            } else {
               LS.saveToken(res.data.token);
               LS.saveUser(res.data.user);
               signInForm.reset();
               signInButton.disabled = false;
               Toast.success('Your are in, nice to see you with us!');
               navigate(routes.home.pathname);
            }
         })
         .catch(handleError);
   };

   return {
      target: signInForm,
      reset() {
         signInEmailInput.reset();
         signInPassInput.reset();
         signInButton.disabled = false;
         errorText.innerText = '';
      },
   };
};
