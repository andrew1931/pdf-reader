import { elem, child, classList, html, children, txt, FunDomUtil } from 'fundom.js';
import { EmptyBoxIcon } from './icons/empty-box';

export const EmptyData = (text: string, ...utils: FunDomUtil<'div'>[]) => {
   return child(
      'div',
      classList(
         'px-10',
         'flex',
         'flex-col',
         'items-center',
         'justify-center',
         'text-slate-400',
         'min-h-[inherit]'
      ),
      children(
         elem('span', html(EmptyBoxIcon), classList('w-24', 'mb-2')),
         elem('span', txt(text), classList('font-medium', 'text-base', 'text-center'))
      ),
      ...utils
   );
};
