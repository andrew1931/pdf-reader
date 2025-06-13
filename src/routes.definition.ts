import { HomeIcon } from './components/icons/home';
import { SettingsIcon } from './components/icons/settings';

export type Route = {
   label: string;
   pathname: string;
   search: string;
   icon: string;
};

type PageKey = 'home' | 'settings';

export const routes: Record<PageKey, Route> = {
   home: { label: 'Home', pathname: '/', search: '', icon: HomeIcon },
   settings: {
      label: 'Settings',
      pathname: '/settings',
      search: '',
      icon: SettingsIcon,
   }
};
