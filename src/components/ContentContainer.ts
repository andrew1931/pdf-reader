import { elem, classList, children } from 'fundom.js';

export const ContentContainer = (...childrenElements: HTMLElement[]): HTMLElement => {
   return elem(
      'div',
      classList(
         'w-full',
         'px-2',
         'sm:w-11/12',
         'md:max-w-5xl',
         'mx-auto',
         'flex',
         'flex-col',
         'pt-14'
      ),
      children(...childrenElements)
   )();
};
