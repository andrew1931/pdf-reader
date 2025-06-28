import { elem, classList, txt } from 'fundom.js';

export const H1 = (text: string): HTMLElement => {
   return elem(
      'h1',
      classList('title', 'text-3xl', 'text-center', 'md:text-5xl', 'mb-3', 'md:mb-5'),
      txt(text)
   )();
};

export const P = (text: string): HTMLElement => {
   return elem(
      'p',
      classList(
         'subtitle',
         'text-center',
         'text-base',
         'md:text-xl',
         'max-w-md',
         'mx-auto',
         'mb-3'
      ),
      txt(text)
   )();
};
