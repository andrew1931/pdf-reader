import { ContentContainer } from '../components/ContentContainer';
import { Layout } from '../components/Layout';
import { Settings } from '../components/Settings/Settings';

export const SettingsPage = (): HTMLElement => {
   return Layout(ContentContainer(Settings()));
};
