import {
   child,
   children,
   classList,
   cmp,
   elem,
   funState,
   html,
   ifElse,
   list,
   on,
   txt,
} from 'fundom.js';
import { useDocumentPageChange } from '../../core/hooks';
import { debounce } from '../../core/utils';
import { type DocumentText } from '../../pdf-reader';
import { Form, Input } from '../Form';
import { SearchIcon } from '../icons/search';
import { Modal } from '../Modal';

export const Search = (searchHandlerFn: () => Promise<DocumentText>): HTMLElement => {
   const [getSearch, setSearch] = funState<DocumentText>([]);
   const [getSearchRegExp, setSearchRegExp] = funState<RegExp>(new RegExp(''));
   const isEmptySearch = cmp(getSearch, (val) => val.length === 0);
   let documentText: DocumentText = [];

   const searchInput = Input({
      placeholder: 'Search string...',
      icon: SearchIcon,
      label: 'Search in document',
   });
   searchInput.target.classList.add('mb-2');
   const form = Form(searchInput.target);

   const applySearch = (searchVal: string) => {
      if (searchVal.length > 0) {
         const regExp = new RegExp(searchVal, 'ig');
         const results = documentText.filter((page) => regExp.test(page.text));
         setSearchRegExp(regExp);
         setSearch(results);
      } else {
         setSearch([]);
      }
   };

   const searchHandler = debounce(() => {
      const searchVal = searchInput.value();
      if (searchVal.length > 0) {
         searchHandlerFn()
            .then((res) => (documentText = res))
            .then(() => applySearch(searchVal));
      } else {
         applySearch('');
      }
   }, 500);

   searchInput.target.oninput = searchHandler;

   form.onsubmit = (e) => {
      e.preventDefault();
      searchHandler();
   };

   return elem(
      'div',
      children(
         form,
         elem(
            'ul',
            classList('list', 'mb-2'),
            ifElse(isEmptySearch)(
               child(
                  'div',
                  classList('w-full', 'text-sm', 'font-semibold', 'text-center', 'mt-4'),
                  txt('Nothing found for your search string :(')
               )
            )(
               list(getSearch, (el) => {
                  return elem(
                     'li',
                     child(
                        'button',
                        classList(
                           'flex',
                           'justify-between',
                           'items-center',
                           'px-2',
                           'py-3',
                           'w-full',
                           'text-left',
                           'shadow-card'
                        ),
                        on('click', () => {
                           useDocumentPageChange.emit(el.pageNumber);
                           Modal.hide();
                        }),
                        child(
                           'span',
                           classList('text-xs', 'w-10/12', 'break-words'),
                           html(
                              'page ' +
                                 `<b>${el.pageNumber}</b>` +
                                 ': ' +
                                 el.text.replace(
                                    getSearchRegExp(),
                                    `<b class="text-yellow-500">${getSearchRegExp().source}</b>`
                                 )
                           )
                        )
                     )
                  );
               })
            )
         )
      )
   )();
};
