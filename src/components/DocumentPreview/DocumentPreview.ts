import { useOutlineToggle, useScrollToggle } from '../../core/hooks';
import { BookOpenIcon } from '../icons/book-open';
import { DeleteIcon } from '../icons/delete';
import { deleteDocument, editDocumentModal } from './edit-document-modal';
import { DocumentInfo } from './DocumentInfo';
import { Document } from '../DocumentSlider/Document';
import { DB, type DbFileMeta } from '../../core/DB';
import { InfoIcon } from '../icons/info';
import { EditIcon } from '../icons/edit';
import { type PdfParsedDocument, PdfReader } from '../../pdf-reader';
import { Toast } from '../Toast';
import { Modal } from '../Modal';
import { TitleIcon } from '../icons/title';
import { attr, children, classList, cmp, elem, funState, html, ifOnly, list, on } from 'fundom.js';

type DropDownItem = {
   label: string;
   icon: string;
   iconColor: string;
   cb: (doc: DbFileMeta) => void;
};

const userMenuItems = (pdfRef?: PdfParsedDocument): DropDownItem[] => {
   const result = [
      {
         label: 'Open',
         icon: BookOpenIcon,
         iconColor: 'text-yellow-500',
         cb: (doc) => {
            Document({
               pdf: pdfRef as PdfParsedDocument,
               doc,
               textOnlyMode: false,
            });
         },
      },
      {
         label: `Open as text <small class="opacity-90">(experimental)</small>`,
         icon: TitleIcon,
         iconColor: 'text-orange-500',
         cb: (doc) => {
            Document({
               pdf: pdfRef as PdfParsedDocument,
               doc,
               textOnlyMode: true,
            });
         },
      },
      {
         label: 'Details',
         icon: InfoIcon,
         iconColor: 'text-blue-500',
         cb: (doc) => {
            Modal.show('Document info', DocumentInfo(doc));
         },
      },
      {
         label: 'Edit title/author',
         icon: EditIcon,
         iconColor: 'text-green-500',
         cb: editDocumentModal,
      },
      {
         label: 'Remove',
         icon: DeleteIcon,
         iconColor: 'text-red-500',
         cb: deleteDocument,
      },
   ];
   if (!pdfRef) {
      result.shift();
      result.shift();
   }
   return result;
};

export const DocumentPreview = (() => {
   const [pdfIsReady, setPdfIsReady] = funState(false);
   const [getMenuItems, setMenuItems] = funState<DropDownItem[]>([]);
   const [isOpen, setIsOpen] = funState(false);
   let docRef: DbFileMeta | undefined;

   const canvas = elem(
      'canvas',
      classList('w-full', 'max-w-full', 'max-h-full', 'transition-opacity', 'duration-500'),
      ifOnly<'canvas'>(cmp(isOpen, (val) => val === false))(classList('opacity-0'))
   )();

   const imgWrapper = elem(
      'div',
      classList(
         'w-72',
         'md:w-[400px]',
         'max-w-full',
         'h-96',
         'md:h-[520px]',
         'max-h-[90vh]',
         'z-10',
         'mr-4',
         'mb-4',
         'transition-transform',
         'origin-right',
         'rounded-md',
         'shadow-card',
         'overflow-hidden',
         'flex',
         'items-center',
         'justify-center',
         'scale-0'
      ),
      ifOnly(isOpen)(classList('scale-100')),
      ifOnly(pdfIsReady)(children(canvas))
   )();

   const menu = elem(
      'ul',
      classList(
         'preview',
         'flex',
         'flex-col',
         'rounded-md',
         'min-w-52',
         'max-w-96',
         'overflow-hidden',
         'text-indigo-900',
         'transition-transform',
         'origin-center',
         'z-10',
         'scale-0'
      ),
      ifOnly(isOpen)(classList('scale-100')),
      ifOnly(pdfIsReady)(
         list(getMenuItems, (item) => {
            return elem(
               'button',
               classList(
                  'card',
                  'flex',
                  'justify-between',
                  'items-center',
                  'text-sm',
                  'font-semibold',
                  'py-2',
                  'px-5',
                  'text-start',
                  'cursor-pointer'
               ),
               attr({ 'aria-label': item.label }),
               children(
                  elem('span', html(item.label)),
                  elem('span', html(item.icon), classList('w-4', 'ml-3', item.iconColor))
               ),
               on('click', (e) => {
                  e.preventDefault();
                  hidePreview();
                  item.cb(docRef as DbFileMeta);
               })
            );
         })
      )
   )();

   const wrapper = elem(
      'div',
      classList('flex', 'flex-wrap', 'justify-center', 'items-center'),
      children(imgWrapper, menu)
   )();

   const el = elem(
      'div',
      classList(
         'flex',
         'justify-center',
         'items-center',
         'fixed',
         'top-0',
         'left-0',
         'w-full',
         'h-full',
         'z-50'
      ),
      children(
         // backdrop
         elem(
            'div',
            on('click', hidePreview),
            classList('absolute', 'w-full', 'h-full', 'cursor-default', 'backdrop-blur')
         ),
         wrapper
      )
   )();

   function hidePreview() {
      if (isOpen()) {
         useOutlineToggle.emit({ value: true });
         useScrollToggle.emit({ value: true });
         setPdfIsReady(false);
         setIsOpen(false);
         document.body.removeChild(el);
      }
   }

   return {
      show(doc: DbFileMeta) {
         docRef = doc;
         if (!isOpen()) {
            useOutlineToggle.emit({
               value: false,
               skippedElement: wrapper,
            });
            useScrollToggle.emit({ value: false });
            document.body.appendChild(el);

            DB.getFile(doc.fileName)
               .then((res) => {
                  PdfReader.read(res.file)
                     .then((pdf) => {
                        pdf.render(canvas, 1);
                        setPdfIsReady(true);
                        setMenuItems(userMenuItems(pdf));
                     })
                     .catch((error) => {
                        Toast.error(error);
                        setPdfIsReady(true);
                        setMenuItems(userMenuItems());
                     });
               })
               .catch(Toast.error);

            setTimeout(() => setIsOpen(true));
         }
      },
   };
})();
