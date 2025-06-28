import { children, classList, elem, txt } from 'fundom.js';
import { type DbFileMeta } from '../../core/DB';
import { bytesToMb } from '../../core/utils';

export const DocumentInfo = (doc: DbFileMeta) => {
   const detail = (label: string, value: string) => {
      return elem(
         'li',
         classList('text-xs', 'mb-1'),
         children(
            elem('span', txt(label + ':'), classList('font-semibold', 'mr-2')),
            elem('span', txt(value), classList('break-all', 'text-[11px]'))
         )
      );
   };
   return elem(
      'ul',
      children(
         detail('File name', doc.fileName),
         detail('Title', doc.title),
         detail('Author', doc.author),
         detail('Pdf version', doc.pdfVersion || '-'),
         detail('File size', bytesToMb(doc.size) + ' mb'),
         detail('Number of pages', String(doc.numberOfPages)),
         detail('Number of bookmarks', String(doc.bookmarks?.length || 0)),
         detail('Last viewed', doc.lastViewedAt.toLocaleString()),
         detail('Added', doc.createdAt.toLocaleString())
      )
   )();
};
