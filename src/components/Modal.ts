import {
   attr,
   children,
   classList,
   cmp,
   elem,
   fmt,
   funState,
   FunStateGetter,
   html,
   ifOnly,
   on,
   style,
   txt,
} from 'fundom.js';
import { useOutlineToggle, useScrollToggle } from '../core/hooks';
import { CloseIcon } from './icons/close';

export const MODAL_ANIMATION_TIME = 300;

export const Modal = (() => {
   const emptyContent = elem('div')();
   const [isOpen, setIsOpen] = funState(false);
   const [getTransitionEnded, setTransitionEnded] = funState(false);
   const [getTitle, setTitle] = funState('');
   const [getTransform, setTransform] = funState(window.innerHeight);
   const [getContent, setContent] = funState<HTMLElement>(emptyContent);
   let onCloseCb: () => void = () => {};

   const contentWrapper = elem(
      'div',
      style({ transform: fmt('translateY({}px)', getTransform) }),
      classList(
         'modal',
         'flex',
         'flex-col',
         'rounded-t-lg',
         'md:rounded',
         'absolute',
         'w-full',
         'md:w-96',
         'max-h-full',
         'overflow-auto',
         'p-6',
         'transition-transform',
         'duration-300'
      ),
      children(
         elem(
            'div',
            classList(
               'title',
               'w-full',
               'flex',
               'items-center',
               'justify-center',
               'relative',
               'mb-4'
            ),
            children(
               // title
               elem('h4', classList('text-center', 'text-sm', 'font-semibold'), txt(getTitle)),
               elem(
                  'button',
                  attr({ 'aria-label': 'Close modal' }),
                  html(CloseIcon),
                  on('click', closeModal),
                  classList(
                     'btn-icon',
                     'w-7',
                     'h-7',
                     'cursor-pointer',
                     'absolute',
                     'right-0',
                     'p-1'
                  )
               )
            )
         ),
         elem(
            'div',
            classList('w-full', 'flex', 'flex-col', 'mt-1', 'flex-1'),
            children(getContent as FunStateGetter<HTMLElement>)
         )
      )
   )();

   const el = elem(
      'div',
      classList(
         'w-full',
         'h-full',
         'fixed',
         'z-50',
         'top-0',
         'left-0',
         'flex',
         'justify-center',
         'items-end',
         'md:items-center',
         'transition-colors',
         'duration-300'
      ),
      ifOnly(getTransitionEnded)(classList('bg-light-opacity')),
      ifOnly(cmp(isOpen, (v) => !v))(classList('hidden')),
      children(
         // backdrop
         elem('div', classList('absolute', 'w-full', 'h-full'), on('click', closeModal)),
         contentWrapper
      )
   )();

   function closeModal() {
      if (isOpen()) {
         setTransitionEnded(false);
         setTransform(window.innerHeight);
         setTimeout(() => {
            setIsOpen(false);
            setContent(emptyContent);
         }, MODAL_ANIMATION_TIME);
         useOutlineToggle.emit({ value: true });
         useScrollToggle.emit({ value: true });
         onCloseCb();
      }
   }

   function showModal(modalTitle: string, content: HTMLElement, onClose?: () => void) {
      if (!isOpen()) {
         if (typeof onClose === 'function') {
            onCloseCb = onClose;
         } else {
            onCloseCb = () => {}; // reset previous callback
         }
         setTitle(modalTitle);
         setContent(content);
         setTimeout(() => {
            setTransform(0);
            setTransitionEnded(true);
         }, 100);
         useOutlineToggle.emit({ value: false, skippedElement: el });
         useScrollToggle.emit({ value: false });
         setIsOpen(true);
      }
   }

   document.body.appendChild(el);

   setTimeout(() => {
      setTransform(window.innerHeight);
   });

   return {
      show: showModal,
      hide: closeModal,
   };
})();
