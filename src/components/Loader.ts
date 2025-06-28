import { elem, html, classList } from 'fundom.js';
import { SpinnerIcon } from './icons/spinner';

export const Loader = () => {
   return elem('div', classList('flex', 'items-center'), html(SpinnerIcon))();
};
