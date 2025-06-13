import { EmptyBoxIcon } from './icons/empty-box';

export const EmptyData = (() => {
   const table = document.createElement('div');
   table.classList.add(
      'px-10',
      'flex',
      'flex-col',
      'items-center',
      'justify-center',
      'text-slate-400',
      'min-h-[inherit]'
   );
   const icon = document.createElement('span');
   icon.innerHTML = EmptyBoxIcon;
   icon.classList.add('w-24', 'mb-2');

   const textEl = document.createElement('span');
   textEl.classList.add('font-medium', 'text-base', 'text-center');

   table.append(icon, textEl);

   return (text: string) => {
      textEl.innerText = text;
      return table;
   };
})();
