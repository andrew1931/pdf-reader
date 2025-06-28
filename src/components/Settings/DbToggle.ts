import { children, classList, elem, txt } from 'fundom.js';
import { DB } from '../../core/DB';
import { Toggle } from '../Toggle';

export const DbToggle = () => {
   const toggle = Toggle(!DB.isDisabled());
   toggle.onChange((val) => {
      if (val) {
         DB.enable();
      } else {
         DB.disable();
      }
   });
   return elem(
      'div',
      classList(
         'w-full',
         'flex',
         'items-center',
         'justify-between',
         'text-slate-400',
         'font-medium',
         'text-sm',
         'my-4'
      ),
      children(elem('span', txt('Enable files cache')), toggle.target)
   )();
};
