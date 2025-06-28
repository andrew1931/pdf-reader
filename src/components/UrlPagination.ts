import { children, classList, elem, funState, ifOnly, on, txt } from 'fundom.js';
import { usePageUpdate, usePaginationEvent, usePaginationRequest } from '../core/hooks';
import {
   updateSearchParams,
   getSearchParam,
   useNavigationEnter,
   useQueryParamsChange,
} from '../core/router';
import { ActionButtonSm } from './Button';

export const PAGE_SIZE = 12;

export const UrlPagination = (dependencyParams: Array<[string, string]> = []): HTMLElement => {
   const [getVisible, setVisible] = funState(false);
   const [getCurrentPage, setCurrentPage] = funState(0);
   const [getMaxNumberOfPages, setMaxNumberOfPages] = funState(0);

   const PAGE_SIZE = 12;
   const MIN_PAGE = 1;

   const getPage = () => parseInt(getSearchParam('page') || String(MIN_PAGE));

   const getOffset = () => (getPage() - 1) * PAGE_SIZE;

   function handleSearchParams() {
      const page = getPage();
      if (page < MIN_PAGE) {
         updateSearchParams('page', String(MIN_PAGE));
      } else {
         let shouldUpdate = dependencyParams.length === 0;
         for (const params of dependencyParams) {
            if (getSearchParam(params[0]) === params[1]) {
               shouldUpdate = true;
            }
         }
         if (shouldUpdate) {
            usePaginationEvent.emit({ limit: PAGE_SIZE, offset: getOffset() });
         }
      }
   }

   const prevButton = ActionButtonSm(
      'Previous',
      on('click', function () {
         if (getPage() > MIN_PAGE) {
            this.disabled = true;
            updateSearchParams('page', String(getPage() - 1));
         }
      })
   );
   const nextButton = ActionButtonSm(
      'Next',
      on('click', function () {
         if (getOffset() + PAGE_SIZE < maxItems) {
            this.disabled = true;
            updateSearchParams('page', String(getPage() + 1));
         }
      })
   );

   useNavigationEnter(() => {
      handleSearchParams();
   });

   useQueryParamsChange(() => {
      handleSearchParams();
   });

   let maxItems = PAGE_SIZE;

   usePaginationRequest.on((data) => {
      maxItems = data;
      const maxNumberOfPages = Math.ceil(maxItems / PAGE_SIZE);
      if (maxItems === 0) {
         setVisible(false);
      } else if (getPage() > maxNumberOfPages) {
         updateSearchParams('page', String(maxNumberOfPages));
      } else {
         if (maxNumberOfPages > MIN_PAGE) {
            nextButton.disabled = getOffset() + PAGE_SIZE >= maxItems;
            prevButton.disabled = getOffset() === 0;
            setCurrentPage(getPage());
            setMaxNumberOfPages(maxNumberOfPages);
            setVisible(true);
         } else {
            setVisible(false);
         }
      }
   });

   usePageUpdate.on(handleSearchParams);

   return elem(
      'div',
      classList('flex', 'flex-col', 'items-center', 'justify-between', 'my-2'),
      ifOnly(getVisible)(
         children(
            elem(
               'p',
               classList('text-xs', 'text-slate-500', 'px-2', 'mb-3'),
               children(
                  elem('span', txt('Showing page ')),
                  elem('span', classList('font-semibold'), txt(getCurrentPage)),
                  elem('span', txt(' out of ')),
                  elem('span', classList('font-semibold'), txt(getMaxNumberOfPages))
               )
            ),
            elem('div', children(prevButton, nextButton))
         )
      )
   )();
};
