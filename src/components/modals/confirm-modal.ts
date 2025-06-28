import { children, classList, elem, on, txt } from 'fundom.js';
import { ActionButton, SubmitButton } from '../Button';
import { Modal, MODAL_ANIMATION_TIME } from '../Modal';

type ConfirmButtonItem = {
   label: string;
   fn: () => void;
};

export const ConfirmModal = (
   warmText: string,
   cancel: ConfirmButtonItem,
   submit: ConfirmButtonItem
) => {
   const buttonsWrapper = elem(
      'div',
      classList('flex', 'justify-center'),
      children(
         ActionButton(
            cancel.label,
            classList('mx-1'),
            on('click', () => {
               Modal.hide();
               cancel.fn();
            })
         ),
         SubmitButton(
            submit.label,
            classList('mx-1'),
            on('click', () => {
               Modal.hide();
               // setTimeout for modal close animation
               setTimeout(() => {
                  submit.fn();
               }, MODAL_ANIMATION_TIME);
            })
         )
      )
   );

   const el = elem(
      'div',
      classList('flex-1', 'flex', 'flex-col', 'justify-center'),
      children(
         elem('span', classList('text-sm', 'mb-8', 'text-slate-500', 'text-center'), txt(warmText)),
         buttonsWrapper
      )
   )();

   Modal.show('Friendly warning', el);
};
