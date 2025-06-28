import { children, classList, elem, fmt, funState, html, txt } from 'fundom.js';
import { DB } from '../../core/DB';
import { useDbInit } from '../../core/hooks';
import { useNavigationEnter } from '../../core/router';
import { bytesToMb } from '../../core/utils';
import { UserIcon } from '../icons/user';
import { settingsButtons } from './buttons-definition';
import { DbToggle } from './DbToggle';
import { ThemeToggle } from './ThemeToggle';

export const Settings = () => {
   const [getStorageInfo, setStorageInfo] = funState('0');

   const userEmailInfo = (email: string) => {
      const iconEl = elem('span', classList('w-6', 'mr-2', 'text-green-500'), html(UserIcon));

      const textEl = elem(
         'span',
         classList('max-w-[90%]', 'text-ellipsis', 'overflow-hidden', 'whitespace-nowrap'),
         txt(email)
      );

      return elem(
         'div',
         classList(
            'title',
            'flex',
            'font-medium',
            'text-base',
            'md:text-xl',
            'my-6',
            'justify-center',
            'align-center'
         ),
         children(iconEl, textEl)
      )();
   };

   const usedStorageEl = elem(
      'span',
      classList(
         'ml-2',
         'text-slate-400',
         'text-xs',
         'overflow-hidden',
         'text-ellipsis',
         'whitespace-nowrap',
         'max-w-[50%]',
         'md:max-w-[70%]'
      ),
      txt(fmt('({}mb)', getStorageInfo))
   )();

   const themeToggle = ThemeToggle();

   useDbInit.on(updateStorageInfo);

   useNavigationEnter(() => {
      updateStorageInfo();
      themeToggle.update();
   });

   function updateStorageInfo() {
      DB.getUsedSize().then((size) => {
         setStorageInfo(bytesToMb(size));
      });
   }

   return elem(
      'div',
      classList(
         'text-center',
         'text-zinc-500',
         'text-base',
         'md:text-xl',
         'w-full',
         'max-w-xl',
         'mx-auto',
         'mt-3',
         'mb-10',
         'rounded-md',
         'p-4'
      ),
      children(
         userEmailInfo('Anonym guest'),
         themeToggle.target,
         DbToggle(),
         settingsButtons.storage(usedStorageEl),
         settingsButtons.report,
         settingsButtons.info,
         settingsButtons.updates
      )
   )();
};
