import {
   child,
   children,
   classList,
   elem,
   fmt,
   funState,
   html,
   ifOnly,
   match,
   matchCase,
   style,
   txt,
} from 'fundom.js';
import { errorToString } from '../core/utils';
import { ErrorIcon } from './icons/error';
import { SuccessIcon } from './icons/success';

export const Toast = (() => {
   const TOAST_DURATION = 3000;
   const ANIMATION_TIME = 300;

   const toast = (title: string, message: string, mode: 'success' | 'error') => {
      const [getTransform, setTransform] = funState(0);

      const el = elem(
         'div',
         style({ transform: fmt('translateY({}px)', getTransform) }),
         classList(
            'fixed',
            'top-2',
            'left-2',
            'w-full',
            'md:w-auto',
            'max-w-toast',
            'z-50',
            'px-4',
            'py-2',
            'border',
            'rounded-lg',
            'transition-transform',
            'duration-300'
         ),
         ifOnly(mode === 'success')(classList('border-green-500', 'bg-green-50')),
         ifOnly(mode === 'error')(classList('border-red-500', 'bg-red-50')),
         child(
            'div',
            classList('flex', 'items-center'),
            children(
               elem(
                  'span',
                  classList('w-8', 'mr-2'),
                  match(mode)(
                     matchCase('success')(html(SuccessIcon), classList('text-green-500')),
                     matchCase('error')(html(ErrorIcon), classList('text-red-500'))
                  )
               ),
               elem(
                  'div',
                  classList('flex', 'flex-col', 'flex-1'),
                  children(
                     elem(
                        'span',
                        txt(title),
                        classList('font-medium', 'text-base', 'text-slate-800')
                     ),
                     elem('span', txt(message), classList('text-sm', 'text-slate-600'))
                  )
               )
            )
         )
      )();

      setTransform(-100);

      document.body.appendChild(el);
      setTimeout(() => {
         setTransform(5);
      }, 100);

      setTimeout(() => {
         setTransform(-100);
         setTimeout(() => {
            document.body.removeChild(el);
         }, ANIMATION_TIME);
      }, TOAST_DURATION);
   };

   return {
      success: (message: string) => {
         toast('Success', message, 'success');
      },
      error: (message: unknown) => {
         toast('Error', errorToString(message), 'error');
      },
   };
})();
