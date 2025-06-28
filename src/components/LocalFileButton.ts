import { DB, KeyExistsError, NotEnabledError } from '../core/DB';
import { errorToString } from '../core/utils';
import { Document } from './DocumentSlider/Document';
import { PdfReader } from '../pdf-reader';
import { AttachmentIcon } from './icons/attachment';
import { Toast } from './Toast';
import { attr, children, classList, elem, html, on, txt } from 'fundom.js';

export const LocalFileButton = () => {
   const fileInput = elem(
      'input',
      classList('hidden'),
      attr({
         type: 'file',
         accept: 'application/pdf',
      }),
      on('change', function () {
         if (this.files) {
            const file = this.files[0];
            this.value = '';
            PdfReader.read(file)
               .then((pdf) => {
                  DB.addFile(file, {
                     title: pdf.title,
                     author: pdf.author,
                     numberOfPages: pdf.numberOfPages,
                     pdfVersion: pdf.pdfVersion,
                  })
                     .then(() => DB.getFileMeta(file.name))
                     .then((doc) => Document({ pdf, doc, textOnlyMode: false }))
                     .catch((error) => {
                        if (error instanceof KeyExistsError || error instanceof NotEnabledError) {
                           console.warn(error);
                           DB.getFileMeta(file.name)
                              .then((doc) => Document({ pdf, doc, textOnlyMode: false }))
                              .catch(Toast.error);
                        } else {
                           Toast.error(error);
                        }
                     });
               })
               .catch((error) => {
                  Toast.error(
                     'Oops, we are not able to show this document: ' + errorToString(error)
                  );
               });
         }
      })
   )();

   const fileButton = elem(
      'button',
      children(
         elem('span', classList('w-4', 'mr-2'), html(AttachmentIcon)),
         elem('span', txt('Choose File'))
      ),
      on('click', function () {
         fileInput.click();
         this.blur();
      }),
      attr({
         'aria-label': 'Choose local file',
         type: 'button',
      }),
      classList(
         'btn',
         'flex',
         'items-center',
         'justify-center',
         'px-6',
         'text-sm',
         'font-semibold',
         'h-11',
         'md:h-10',
         'rounded-3xl',
         'text-slate-50',
         'bg-button-500',
         'active:bg-button-600',
         'md:active:bg-button-600',
         'disabled:bg-button-400'
      )
   )();

   return elem('div', classList('mx-auto', 'my-6'), children(fileInput, fileButton))();
};
