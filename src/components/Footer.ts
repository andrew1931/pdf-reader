import { EssentialLinks } from './EssentialLinks';
import packageJson from '../../package.json';

export const Footer = (showLinks: boolean): HTMLElement => {
   const el = document.createElement('footer');
   el.classList.add('flex', 'flex-col', 'items-center', 'mt-4', 'pb-20', 'md:pb-4', 'p-4');
   const copyRight = document.createElement('span');
   copyRight.innerText = `© ${new Date().getFullYear()} Pdf Swiper v.${packageJson.version}`;
   copyRight.classList.add('text-xs', 'text-slate-400', 'mb-1');
   el.appendChild(copyRight);
   if (showLinks) {
      el.appendChild(EssentialLinks());
   }
   return el;
};
