
export const LS = (() => {
   const LS_THEME_KEY = '@vxt_swiper_theme';
   const LS_DB_ENABLED_KEY = '@vxt_swiper_db_enabled';

   return {
      saveTheme(theme: string) {
         localStorage.setItem(LS_THEME_KEY, theme);
      },
      getTheme() {
         return localStorage.getItem(LS_THEME_KEY);
      },
      saveDbIsEnabled(value: '1' | '0') {
         localStorage.setItem(LS_DB_ENABLED_KEY, value);
      },
      getDbIsEnabled() {
         if (!localStorage.getItem(LS_DB_ENABLED_KEY)) return true;
         return localStorage.getItem(LS_DB_ENABLED_KEY) === '1';
      }
   };
})();
