import { elem, txt, classList, child, children, ifOnly } from 'fundom.js';
import { EssentialLinks } from './EssentialLinks';
import packageJson from '../../package.json';

export const Footer = (showLinks: boolean): HTMLElement => {
   return elem(
      'footer',
      classList('flex', 'flex-col', 'items-center', 'mt-4', 'pb-20', 'md:pb-4', 'p-4'),
      child(
         'span',
         txt(`© ${new Date().getFullYear()} Pdf Swiper v.${packageJson.version}`),
         classList('text-xs', 'text-slate-400', 'mb-1')
      ),
      ifOnly(showLinks)(children(EssentialLinks()))
   )();
};
