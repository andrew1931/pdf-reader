import { elem, attr, on, txt, classList, children } from 'fundom.js';
import { PolicyModal } from './modals/policy-modal';
import { openIssuesPage } from './Settings/buttons-definition';

export const A = (label: string, cb: () => void) => {
   return elem(
      'a',
      attr({ href: '' }),
      classList('link', 'text-xs', 'underline', 'px-1', 'cursor-pointer'),
      txt(label),
      on('click', function (e) {
         e.preventDefault();
         cb();
         this.blur();
      })
   )();
};

export const EssentialLinks = (): HTMLElement => {
   return elem(
      'div',
      classList('flex', 'justify-center'),
      children(A('Our policy', PolicyModal), A('Report issue', openIssuesPage))
   )();
};
