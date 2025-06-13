import { useThemeToggle } from '../../core/hooks';
import { Theme } from '../../theme';
import { Toggle } from '../Toggle';

export const ThemeToggle = () => {
   const label = document.createElement('div');
   label.classList.add(
      'w-full',
      'flex',
      'items-center',
      'justify-between',
      'text-slate-400',
      'font-medium',
      'text-sm',
      'my-4'
   );
   const text = document.createElement('span');
   text.innerText = 'Dark mode';
   const toggle = Toggle(Theme.isDarkTheme());
   toggle.onChange(() => useThemeToggle.emit());
   label.append(text, toggle.target);
   return {
      target: label,
      update() {
         toggle.update(Theme.isDarkTheme());
      },
   };
};
