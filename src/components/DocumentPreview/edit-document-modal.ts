import { errorToString } from '../../core/utils';
import { SubmitButton } from '../Button';
import { Input, Form, FormError } from '../Form';
import { Modal } from '../Modal';
import { TitleIcon } from '../icons/title';
import { AuthorIcon } from '../icons/author';
import { ModalError } from '../Error';
import { usePageUpdate } from '../../core/hooks';
import { ConfirmModal } from '../modals/confirm-modal';
import { Toast } from '../Toast';
import { DB, DbFileMeta } from '../../core/DB';
import { classList, funState } from 'fundom.js';

export function editDocumentModal(doc: DbFileMeta) {
   const [getErrorText, setErrorText] = funState('');
   const button = SubmitButton('Edit', classList('mt-4'));

   const titleInput = Input({
      label: 'Title',
      name: 'title',
      placeholder: 'Enter title',
      icon: TitleIcon,
      value: doc.title,
   });
   const authorInput = Input({
      label: 'Author',
      name: 'author',
      placeholder: 'Enter author',
      icon: AuthorIcon,
      value: doc.author,
   });
   const form = Form(titleInput.target, authorInput.target, button, FormError(getErrorText));

   form.onsubmit = (e) => {
      e.preventDefault();
      setErrorText('');

      if (!titleInput.value()) {
         setErrorText('Title field is required');
         return;
      }
      if (!authorInput.value()) {
         setErrorText('Author field is required');
         return;
      }

      if (doc.author === authorInput.value() && doc.title === titleInput.value()) {
         setErrorText('Nothing was changed');
         return;
      }

      button.disabled = true;
      DB.editFileMeta(doc.fileName, {
         author: authorInput.value(),
         title: titleInput.value(),
      })
         .then(() => {
            button.disabled = false;
            usePageUpdate.emit();
            Modal.hide();
            Toast.success('Your document was edited successfully');
         })
         .catch((error) => {
            setErrorText(errorToString(error));
            button.disabled = false;
         });
   };
   Modal.show('Edit document', form);
}

export function deleteDocument(doc: DbFileMeta) {
   ConfirmModal(
      'Are you positive you want to delete this document? This action cannot be undone :(',
      { label: 'Cancel', fn: () => Modal.hide() },
      {
         label: 'Delete',
         fn: () => {
            DB.deleteFile(doc.fileName)
               .then(() => {
                  usePageUpdate.emit();
                  Toast.success('Your document was deleted successfully');
               })
               .catch((error) => {
                  Modal.show(
                     'Delete document error',
                     ModalError('We were not able to delete this document:(', error)
                  );
               });
         },
      }
   );
}
