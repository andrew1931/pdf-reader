import {
   attr,
   child,
   children,
   classList,
   elem,
   FunStateGetter,
   html,
   ifOnly,
   txt,
} from 'fundom.js';

const MAX_INPUT_LENGTH = '1000';

const Label = (text: string, inputEl: HTMLElement, required: boolean): HTMLElement => {
   return elem(
      'label',
      classList('mt-2', 'flex', 'flex-col'),
      children(
         elem(
            'div',
            txt(text),
            classList('label', 'text-sm', 'font-semibold', 'ml-2', 'mb-1'),
            child('small', classList('ml-1', 'opacity-80'), ifOnly(!required)(txt('(optional)')))
         ),
         inputEl
      )
   )();
};

export const FormError = (text: string | FunStateGetter<string> = '') => {
   return elem(
      'span',
      classList('my-2', 'w-full', 'text-xs', 'text-center', 'text-red-500', 'font-semibold'),
      txt(text)
   )();
};

export const Form = (...inputs: HTMLElement[]): HTMLFormElement => {
   return elem(
      'form',
      classList('mt-2', 'flex', 'flex-col', 'w-full', 'overflow-hidden', 'p-2'),
      children(...inputs)
   )();
};

export const Input = (conf: {
   name?: string;
   placeholder: string;
   label: string;
   value?: string;
   icon?: string;
   type?: string;
   required?: boolean;
}) => {
   const input = elem(
      'input',
      classList(
         'flex-1',
         'h-full',
         'pl-9',
         'pr-2',
         'border-none',
         'text-base',
         'md:text-sm',
         'disabled:opacity-50',
         'rounded-[inherit]'
      ),
      attr({
         type: conf.type || 'text',
         name: conf.name || '',
         placeholder: conf.placeholder,
         maxlength: MAX_INPUT_LENGTH,
         value: conf.value || '',
      })
   )();

   const inputWrapper = elem(
      'div',
      classList(
         'flex',
         'items-center',
         'h-11',
         'md:h-10',
         'border',
         'border-yellow-500',
         'rounded-3xl',
         'relative'
      ),
      ifOnly(conf.icon)(
         child(
            'span',
            html(conf.icon as string),
            classList('input-icon', 'w-4', 'left-3', 'absolute')
         )
      ),
      children(input)
   )();

   return {
      target: Label(conf.label, inputWrapper, conf.required ?? true),
      value() {
         return input.value.trim();
      },
      setValue(value: string) {
         input.value = value;
      },
      onChange(cb: (e: Event) => void) {
         input.oninput = cb;
      },
      reset() {
         input.value = '';
      },
      disable() {
         input.disabled = true;
      },
      enable() {
         input.disabled = false;
      },
   };
};

export const Textarea = (conf: {
   label: string;
   name: string;
   placeholder: string;
   required?: boolean;
}) => {
   const textarea = elem(
      'textarea',
      classList(
         'w-full',
         'h-40',
         'px-4',
         'py-4',
         'resize-none',
         'border',
         'border-yellow-500',
         'rounded-3xl',
         'text-base',
         'md:text-sm',
         'disabled:opacity-50'
      ),
      attr({
         name: conf.name,
         placeholder: conf.placeholder,
         maxlength: MAX_INPUT_LENGTH,
      })
   )();

   return {
      target: Label(conf.label, textarea, conf.required ?? true),
      value() {
         return textarea.value.trim();
      },
      reset() {
         textarea.value = '';
      },
   };
};
