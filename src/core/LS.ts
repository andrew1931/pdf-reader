import { type UserResponse } from '../api/types';

export const LS = (() => {
   const LS_TOKEN_KEY = '@vxt_swiper_token';
   const LS_USER_KEY = '@vxt_swiper_user';
   const LS_THEME_KEY = '@vxt_swiper_theme';
   const LS_DB_ENABLED_KEY = '@vxt_swiper_db_enabled';

   return {
      hasToken(): boolean {
         return localStorage.getItem(LS_TOKEN_KEY) !== null;
      },
      getToken(): string | null {
         return localStorage.getItem(LS_TOKEN_KEY);
      },
      saveToken(token: string): void {
         localStorage.setItem(LS_TOKEN_KEY, token);
      },
      saveUser(user: UserResponse['data']) {
         localStorage.setItem(LS_USER_KEY, JSON.stringify(user));
      },
      getUser(): UserResponse['data'] {
         try {
            return JSON.parse(localStorage.getItem(LS_USER_KEY) || '');
         } catch (error) {
            console.error(error);
            return null;
         }
      },
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
      },
      removeLSData(): void {
         localStorage.removeItem(LS_TOKEN_KEY);
         localStorage.removeItem(LS_USER_KEY);
      },
   };
})();
