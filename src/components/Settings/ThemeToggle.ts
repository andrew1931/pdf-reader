import { children, classList, elem, txt } from 'fundom.js';
import { useThemeToggle } from '../../core/hooks';
import { Theme } from '../../theme';
import { Toggle } from '../Toggle';

export const ThemeToggle = () => {
   const toggle = Toggle(Theme.isDarkTheme());
   toggle.onChange(() => useThemeToggle.emit());
   const label = elem(
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
      children(elem('span', txt('Dark mode')), toggle.target)
   )();
   return {
      target: label,
      update() {
         toggle.update(Theme.isDarkTheme());
      },
   };
};
