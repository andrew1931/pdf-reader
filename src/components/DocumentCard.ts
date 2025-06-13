import { type DbFileMeta } from '../core/DB';
import { DocumentPreview } from './DocumentPreview/DocumentPreview';

export const DocumentCard = (doc: DbFileMeta) => {
   const li = document.createElement('li');
   li.classList.add(
      'cursor-pointer',
      'w-full',
      'sm:w-[46%]',
      'md:w-[31%]',
      'lg:w-[23%]',
      'sm:mx-[1%]',
      'h-[420px]',
      'sm:h-72',
      'md:h-60',
      'lg:h-72',
      'rounded-md',
      'mb-6',
      'md:transition-transform',
      'md:active:scale-95'
   );

   const docTitle = document.createElement('span');
   docTitle.classList.add(
      'text-center',
      'text-slate-50',
      'text-xl',
      'md:text-sm',
      'font-semibold',
      'break-words',
      'z-10',
      'line-clamp-6'
   );
   docTitle.innerText = doc.title;
   const docAuthor = document.createElement('span');
   docAuthor.innerText = doc.author;
   docAuthor.classList.add(
      'text-center',
      'text-slate-100',
      'text-sm',
      'md:text-xs',
      'break-words',
      'z-10',
      'line-clamp-2'
   );

   const innerBorder = document.createElement('div');
   innerBorder.classList.add(
      'w-full',
      'h-full',
      'flex',
      'flex-col',
      'pt-6',
      'pb-4',
      'px-1',
      'justify-between',
      'border',
      'rounded-md',
      'relative',
      'overflow-hidden'
   );
   innerBorder.append(docTitle, docAuthor);

   const badgesWrapper = document.createElement('div');
   badgesWrapper.classList.add(
      'absolute',
      'flex',
      'items-center',
      'justify-center',
      '-right-1.5',
      '-top-1.5'
   );

   const button = document.createElement('button');
   button.setAttribute('aria-label', 'Document card');
   button.classList.add(
      'btn-card',
      'cursor-pointer',
      'relative',
      'flex',
      'items-center',
      'justify-center',
      'rounded-[inherit]',
      'h-full',
      'w-full',
      'bg-gradient-to-r',
      'from-sky-500',
      'to-indigo-500',
      'p-2',
      'shadow-card',
      'overflow-visible'
   );
   button.onclick = () => DocumentPreview.show(doc);
   button.append(innerBorder, badgesWrapper);
   li.appendChild(button);
   return li;
};
