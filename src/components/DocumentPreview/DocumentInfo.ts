import { type DbFileMeta } from '../../core/DB';
import { bytesToMb } from '../../core/utils';

export const DocumentInfo = (doc: DbFileMeta) => {
   const details = document.createElement('ul');
   const detail = (label: string, value: string) => {
      const li = document.createElement('li');
      li.classList.add('text-xs', 'mb-1');
      const labelEl = document.createElement('span');
      labelEl.innerText = label + ':';
      labelEl.classList.add('font-semibold', 'mr-2');
      const valueEl = document.createElement('span');
      valueEl.innerText = value;
      valueEl.classList.add('break-all', 'text-[11px]');
      li.classList.add();
      li.append(labelEl, valueEl);
      return li;
   };

   details.append(
      detail('File name', doc.fileName),
      detail('Title', doc.title),
      detail('Author', doc.author),
      detail('Pdf version', doc.pdfVersion || '-'),
      detail('File size', bytesToMb(doc.size) + ' mb'),
      detail('Number of pages', String(doc.numberOfPages)),
      detail('Number of bookmarks', String(doc.bookmarks?.length || 0)),
      detail('Last viewed', doc.lastViewedAt.toLocaleString()),
      detail('Added', doc.createdAt.toLocaleString())
   );
   return details;
};
