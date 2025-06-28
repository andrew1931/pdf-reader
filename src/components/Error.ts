import { elem, classList, txt, children, on } from 'fundom.js';
import { errorToString } from '../core/utils';
import { ActionButton } from './Button';
import { Modal } from './Modal';

export const ModalError = (subtitle: string, text: unknown) => {
   return elem(
      'div',
      classList('flex', 'flex-col', 'justify-between', 'w-full', 'flex-1'),
      children(
         elem(
            'p',
            classList('w-full', 'text-sm', 'text-center', 'text-slate-500', 'font-semibold'),
            txt(subtitle)
         ),
         elem(
            'p',
            classList('w-full', 'text-sm', 'text-slate-400', 'mt-2', 'mb-4', 'text-center'),
            txt(errorToString(text))
         ),
         ActionButton(
            'OK',
            on('click', () => Modal.hide())
         )
      )
   )();
};
