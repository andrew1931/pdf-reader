import { elem, classList, child, txt, attr, type FunDomUtil, FunStateGetter } from 'fundom.js';

export const ActionButtonSm = (
   text: string | FunStateGetter<string>,
   ...utils: FunDomUtil<'button'>[]
): HTMLButtonElement => {
   return elem(
      'button',
      classList(
         'btn',
         'text-sm',
         'md:text-xs',
         'font-medium',
         'px-6',
         'py-2',
         'mx-1',
         'rounded-full',
         'text-slate-600',
         'bg-white',
         'active:bg-slate-100',
         'md:active:bg-slate-100',
         'disabled:bg-slate-50',
         'disabled:text-slate-400',
         'shadow-card'
      ),
      txt(text),
      ...utils
   )();
};

const Button = (text: string | FunStateGetter<string>) => {
   return elem(
      'button',
      classList(
         'text-sm',
         'font-semibold',
         'w-36',
         'h-11',
         'md:h-10',
         'flex',
         'items-center',
         'justify-center',
         'rounded-3xl',
         'relative',
         'self-end'
      ),
      child(
         'span',
         classList('absolute', 'translate-x-0', 'transition-transform', 'duration-300'),
         txt(text),
         attr({ 'aria-label': text })
      )
   );
};

export const SubmitButton = (text: string, ...utils: FunDomUtil<'button'>[]): HTMLButtonElement => {
   return Button(text)(
      classList(
         'btn',
         'text-slate-50',
         'bg-button-500',
         'active:bg-button-600',
         'md:active:bg-button-600',
         'disabled:bg-button-400'
      ),
      attr({ type: 'submit' }),
      ...utils
   );
};

export const ActionButton = (
   text: string | FunStateGetter<string>,
   ...utils: FunDomUtil<'button'>[]
): HTMLElement => {
   return Button(text)(
      classList(
         'btn',
         'bg-slate-50',
         'border',
         'border-slate-200',
         'text-zinc-700',
         'active:bg-slate-300',
         'active:bg-slate-300',
         'md:active:bg-slate-300',
         'disabled:bg-slate-100'
      ),
      attr({ type: 'button' }),
      ...utils
   );
};
