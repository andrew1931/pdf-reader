import { classList, elem, funState, html } from 'fundom.js';
import { errorToString } from '../../core/utils';
import { Modal } from '../Modal';

export const PolicyModal = () => {
   const [getText, setText] = funState('');

   fetch(ROUTE_PREFIX + '/policy.txt')
      .then((res) => res.text())
      .then((res) => {
         setText(errorToString(res));
      })
      .catch((error) => {
         setText(errorToString(error));
      });

   Modal.show(
      'Privacy policy',
      elem('p', classList('policy-text', 'whitespace-break-spaces', 'text-sm'), html(getText))()
   );
};
