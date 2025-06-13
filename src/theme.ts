import { LS } from './core/LS';
import { html } from './core/utils';

export const Theme = (() => {
   const themes = {
      dark: 'dark',
      light: 'light',
   };
   const defaultTheme = themes.dark;

   const htmlEl = html();

   function handleThemeChange(initialValue?: string) {
      let newTheme = '';
      if (initialValue) {
         newTheme = initialValue;
      } else {
         if (htmlEl.getAttribute('theme') === themes.dark) {
            newTheme = themes.light;
         } else {
            newTheme = themes.dark;
         }
      }
      htmlEl.setAttribute('theme', newTheme);
      LS.saveTheme(newTheme);
   }

   handleThemeChange(LS.getTheme() || defaultTheme);

   return {
      handleThemeChange,
      isDarkTheme(): boolean {
         return LS.getTheme() === themes.dark;
      },
   };
})();
