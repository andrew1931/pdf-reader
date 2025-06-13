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

type DropDownItem = {
   label: string;
   icon: string;
   iconColor: string;
   cb: (doc: DbFileMeta) => void;
};

const userMenuItems: (pdf?: PdfParsedDocument) => DropDownItem[] = (pdf) => {
   const result = [
      {
         label: 'Open',
         icon: BookOpenIcon,
         iconColor: 'text-yellow-500',
         cb: (doc) => {
            Document({
               pdf: pdf as PdfParsedDocument,
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
               pdf: pdf as PdfParsedDocument,
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
   if (!pdf) {
      result.shift();
   }
   return result;
};

const MenuItems = (menuItems: DropDownItem[], doc: DbFileMeta, hidePreview: () => void) => {
   return menuItems.map((item) => {
      const btn = document.createElement('button');
      btn.classList.add(
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
      );
      btn.setAttribute('aria-label', item.label);
      const label = document.createElement('span');
      label.innerHTML = item.label;
      const icon = document.createElement('span');
      icon.innerHTML = item.icon;
      icon.classList.add('w-4', 'ml-3', item.iconColor);
      btn.onclick = (e) => {
         e.preventDefault();
         hidePreview();
         item.cb(doc);
      };
      btn.append(label, icon);
      return btn;
   });
};

export const DocumentPreview = (() => {
   let isOpen = false;

   const el = document.createElement('div');
   el.classList.add(
      'flex',
      'justify-center',
      'items-center',
      'fixed',
      'top-0',
      'left-0',
      'w-full',
      'h-full',
      'z-50'
   );

   const backdrop = document.createElement('div');
   backdrop.classList.add('absolute', 'w-full', 'h-full', 'cursor-default', 'backdrop-blur');
   backdrop.onclick = hidePreview;

   const menu = document.createElement('ul');
   menu.classList.add(
      'preview',
      'flex',
      'flex-col',
      'rounded-md',
      'min-w-52',
      'max-w-96',
      'overflow-hidden',
      'text-indigo-900',
      'transition-transform',
      'scale-0',
      'origin-center',
      'z-10'
   );

   const canvas = document.createElement('canvas');
   canvas.classList.add(
      'w-full',
      'max-w-full',
      'max-h-full',
      'opacity-0',
      'transition-opacity',
      'duration-500'
   );

   const imgWrapper = document.createElement('div');
   imgWrapper.classList.add(
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
      'scale-0',
      'origin-right',
      'rounded-md',
      'shadow-card',
      'overflow-hidden',
      'flex',
      'items-center',
      'justify-center'
   );

   const wrapper = document.createElement('div');
   wrapper.append(imgWrapper, menu);
   wrapper.classList.add('flex', 'flex-wrap', 'justify-center', 'items-center');
   el.append(backdrop, wrapper);

   function hidePreview() {
      if (isOpen) {
         useOutlineToggle.emit({ value: true });
         useScrollToggle.emit({ value: true });
         menu.classList.remove('scale-100');
         menu.classList.add('scale-0');
         menu.innerHTML = '';
         imgWrapper.classList.add('scale-0');
         imgWrapper.classList.remove('scale-100');
         if (imgWrapper.childNodes.length > 0) {
            imgWrapper.removeChild(canvas);
            canvas.classList.add('opacity-0');
         }
         document.body.removeChild(el);
         isOpen = false;
      }
   }

   return {
      show(doc: DbFileMeta) {
         if (!isOpen) {
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
                        imgWrapper.appendChild(canvas);
                        menu.append(...MenuItems(userMenuItems(pdf), doc, hidePreview));
                        setTimeout(() => {
                           if (isOpen) {
                              canvas.classList.remove('opacity-0');
                           }
                        }, 300);
                     })
                     .catch((error) => {
                        Toast.error(error);
                        menu.append(...MenuItems(userMenuItems(), doc, hidePreview));
                     });
               })
               .catch(Toast.error);

            setTimeout(() => {
               menu.classList.remove('scale-0');
               menu.classList.add('scale-100');
               imgWrapper.classList.remove('scale-0');
               imgWrapper.classList.add('scale-100');
               isOpen = true;
            });
         }
      },
   };
})();
