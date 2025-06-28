import { attr, children, classList, elem, html, ifOnly, on, txt } from 'fundom.js';

export type SettingsActionButton = {
   label: string;
   labelInfo?: HTMLElement;
   icon: string;
   iconColor: string;
   action: () => void;
};

export const SettingButton = (item: SettingsActionButton): HTMLButtonElement => {
   return elem(
      'button',
      attr({ 'aria-label': item.label }),
      classList(
         'card',
         'w-full',
         'flex',
         'items-center',
         'shadow-card',
         'rounded-full',
         'font-medium',
         'text-base',
         'py-2',
         'px-4',
         'my-2',
         'cursor-pointer'
      ),
      on('click', function (e) {
         e.preventDefault();
         item.action();
         this.blur();
      }),
      children(
         elem('span', html(item.icon), classList('w-5', 'mr-4', item.iconColor)),
         elem('span', txt(item.label))
      ),
      ifOnly<'button'>(item.labelInfo)(children(item.labelInfo as HTMLElement))
   )();
};
