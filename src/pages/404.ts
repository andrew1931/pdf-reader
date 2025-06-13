import { H1 } from '../components/Title';
import { ContentContainer } from '../components/ContentContainer';

export const NotFoundPage = (): HTMLElement => {
   return ContentContainer(H1('Page was not found :('));
};
