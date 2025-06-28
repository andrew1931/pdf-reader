import { elem, attr, children } from 'fundom.js';
import { Footer } from './Footer';
import { Header } from './Header';

export const Layout = (content: HTMLElement) => {
   return elem('div', attr({ id: 'layout' }), children(Header(), content, Footer(false)))();
};
