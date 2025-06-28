import {
   attr,
   child,
   children,
   classList,
   elem,
   funState,
   type FunStateGetter,
   FunStateSetter,
   html,
   list,
   on,
   txt,
} from 'fundom.js';
import { DB, type DbFileMeta } from '../../core/DB';
import { useDocumentPageChange } from '../../core/hooks';
import { SubmitButton } from '../Button';
import { Form, Input } from '../Form';
import { DeleteIcon } from '../icons/delete';
import { InfoIcon } from '../icons/info';
import { Modal } from '../Modal';
import { Toast } from '../Toast';

const BookmarksList = (
   getBookmarks: FunStateGetter<DbFileMeta['bookmarks']>,
   setBookmarks: FunStateSetter<DbFileMeta['bookmarks']>,
   fileName: string
) => {
   return elem(
      'ul',
      classList('list', 'mb-2'),
      list(getBookmarks, (el, index) => {
         return elem(
            'li',
            child(
               'button',
               classList(
                  'flex',
                  'justify-between',
                  'items-center',
                  'p-2',
                  'w-full',
                  'text-left',
                  'shadow-card'
               ),
               on('click', () => {
                  useDocumentPageChange.emit(el.page);
                  Modal.hide();
               }),
               children(
                  elem('span', classList('text-xs', 'w-10/12', 'break-words'), txt(el.note)),
                  elem(
                     'button',
                     attr({ 'aria-label': 'Remove bookmark' }),
                     classList('btn-icon', 'w-12', 'px-4', 'py-2'),
                     html(DeleteIcon),
                     on('click', (e) => {
                        e.stopPropagation();
                        const newBookmarks = [...getBookmarks()];
                        newBookmarks.splice(index, 1);
                        DB.editFileMeta(fileName, { bookmarks: newBookmarks })
                           .then(() => setBookmarks(newBookmarks))
                           .catch(Toast.error);
                     })
                  )
               )
            )
         );
      })
   );
};

export const AddBookmark = (fileName: string, currentPage: number): HTMLElement => {
   const [getBookmarks, setBookmarks] = funState<DbFileMeta['bookmarks']>([]);
   const button = SubmitButton('Add', classList('mt-3'));

   const bookmarkInput = Input({
      label: 'Add a bookmark note',
      name: 'bookmark',
      placeholder: 'Enter a note',
      icon: InfoIcon,
      required: false,
   });
   const form = Form(bookmarkInput.target, button);
   form.onsubmit = (e) => {
      e.preventDefault();
      const bookmark = {
         page: currentPage,
         note: bookmarkInput.value() || 'page ' + currentPage,
      };

      const bookmarkExists =
         getBookmarks().findIndex((el) => {
            return el.page === bookmark.page && el.note === bookmark.note;
         }) > -1;

      if (bookmarkExists) {
         Toast.error(`Bookmark with such text for page ${bookmark.page} already exists`);
         return;
      }

      setBookmarks([...getBookmarks(), bookmark]);
      DB.editFileMeta(fileName, { bookmarks: getBookmarks() })
         .then(() => form.reset())
         .catch(Toast.error);
   };

   function updateListData() {
      DB.getFileMeta(fileName)
         .then((res) => {
            if (res.bookmarks && Array.isArray(res.bookmarks)) {
               setBookmarks(res.bookmarks);
            } else {
               setBookmarks([]);
            }
         })
         .catch((error) => {
            Toast.error(error);
         });
   }

   updateListData();

   return elem('div', children(form, BookmarksList(getBookmarks, setBookmarks, fileName)))();
};
