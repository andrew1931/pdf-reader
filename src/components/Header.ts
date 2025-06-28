import { elem, html, txt, classList, child, list, ifOnly, children } from 'fundom.js';
import { isCurrentRoute, Link, normalizedPath } from '../core/router';
import { routes } from '../routes.definition';

const menuItems = [routes.home, routes.settings];

export const Header = (): HTMLHeadElement => {
   return elem(
      'header',
      classList(
         'header',
         'md:mb-1',
         'flex',
         'justify-center',
         'px-2',
         'fixed',
         'md:relative',
         'left-0',
         'bottom-0',
         'md:bg-transparent',
         'z-40',
         'w-full'
      ),
      child(
         'ul',
         classList('flex', 'w-full', 'justify-around', 'md:justify-end'),
         list(menuItems, (item) => {
            return elem(
               'li',
               children(
                  Link(item.pathname + item.search)(
                     classList(
                        'btn-icon',
                        'flex',
                        'flex-col',
                        'justify-center',
                        'items-center',
                        'rounded-full',
                        'w-[63px]',
                        'h-[63px]',
                        'mt-1',
                        'mb-2',
                        'md:flex-row',
                        'md:p-2',
                        'md:w-auto',
                        'md:h-auto',
                        'md:mx-4',
                        'md:mt-4'
                     ),
                     ifOnly<'button'>(isCurrentRoute(item.pathname, normalizedPath()))(
                        classList('text-button-400')
                     ),
                     child('span', classList('w-5', 'h-5', 'mb-[4px]'), html(item.icon)),
                     child(
                        'span',
                        classList('text-[10px]', 'md:underline', 'md:text-sm', 'md:ml-2'),
                        txt(item.label)
                     )
                  )
               )
            );
         })
      )
   )();
};
