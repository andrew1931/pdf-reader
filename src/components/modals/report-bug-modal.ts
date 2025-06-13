import { SubmitButton } from '../Button';
import { Form, FormError, Textarea } from '../Form';
import { Modal } from '../Modal';

export function reportBugModal() {
   const errorText = FormError();
   const button = SubmitButton('Report');
   button.classList.add('mt-4');
   const descriptionInput = Textarea({
      label: 'Description',
      name: 'description',
      placeholder: 'Enter reproduction steps of the issue if possible',
   });
   const form = Form(descriptionInput.target, button, errorText);
   form.onsubmit = (e) => {
      e.preventDefault();
      errorText.innerText = '';
      if (!descriptionInput.value()) {
         errorText.innerText = 'Description field is required';
         return;
      }

      button.disabled = true;
   };
   Modal.show('Issue report', form);
}
