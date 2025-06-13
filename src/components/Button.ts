export const ActionButtonSm = (text: string): HTMLButtonElement => {
   const el = document.createElement('button');
   el.classList.add(
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
   );
   el.innerText = text;
   return el;
};

const Button = (text: string) => {
   const buttonText = document.createElement('span');
   buttonText.innerText = text;
   buttonText.classList.add('absolute', 'translate-x-0', 'transition-transform', 'duration-300');
   const el = document.createElement('button');
   el.classList.add(
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
   );
   el.setAttribute('aria-label', text);
   el.append(buttonText);
   return el;
};

export const SubmitButton = (text: string) => {
   const el = Button(text);
   el.classList.add(
      'btn',
      'text-slate-50',
      'bg-button-500',
      'active:bg-button-600',
      'md:active:bg-button-600',
      'disabled:bg-button-400'
   );
   el.setAttribute('type', 'submit');
   return el;
};

export const ActionButton = (text: string) => {
   const el = Button(text);
   el.classList.add(
      'btn',
      'bg-slate-50',
      'border',
      'border-slate-200',
      'text-zinc-700',
      'active:bg-slate-300',
      'active:bg-slate-300',
      'md:active:bg-slate-300',
      'disabled:bg-slate-100'
   );
   el.setAttribute('type', 'button');
   return el;
};
