import { children, classList, elem, funState, html, on, txt } from 'fundom.js';
import { errorToString } from '../../core/utils';
import { Modal } from '../Modal';
import { ActionButton } from '../Button';

export const CheckUpdatesModal = () => {
   const [btnText, setBtnText] = funState('Okay');
   const [getDescription, setDescription] = funState('');

   fetch(ROUTE_PREFIX + '/version.json')
      .then((res) => res.json())
      .then((res) => {
         if (BUILD_VERSION === res.buildHash) {
            setDescription('You have the latest version of PDF swiper');
         } else {
            setDescription('New version of PDF swiper is available');
            setBtnText('Update');
         }
      })
      .catch((error) => {
         setDescription(errorToString(error));
      });

   const wrapper = elem(
      'div',
      classList(
         'text-sm',
         'text-slate-400',
         'text-center',
         'flex-1',
         'flex',
         'flex-col',
         'justify-between',
         'items-center'
      ),
      children(
         elem(
            'span',
            classList('mt-6', 'mb-1'),
            html(
               `Current app was released on <b>${new Date(Number(BUILD_VERSION)).toDateString()}</b>`
            )
         ),
         elem('span', txt(getDescription)),
         ActionButton(
            btnText,
            classList('mx-auto', 'mt-6', 'mb-6'),
            on('click', () => {
               if (btnText() === 'Okay') {
                  Modal.hide();
               } else {
                  window.location.reload();
               }
            })
         )
      )
   )();
   Modal.show('Updates', wrapper);
};
