import { elem, classList, child, list, ifElse, cmp, funState } from 'fundom.js';
import {
   type SortOrder,
   type PaginationEvent,
   useDocumentsFetch,
   useDocumentsSort,
   usePaginationEvent,
   usePaginationRequest,
} from '../core/hooks';
import { DB, type DbFileMeta, NotInitError } from '../core/DB';
import { Toast } from './Toast';
import { DocumentCard } from './DocumentCard';
import { EmptyData } from './EmptyData';

export const DocumentsList = (): HTMLElement => {
   let fetchedFiles: DbFileMeta[] = [];
   let sorOrder: SortOrder = 'DESC';
   let paginationState: PaginationEvent | null = null;

   const [visibleFiles, setVisibleFiles] = funState<DbFileMeta[]>([]);
   const filesExist = cmp(visibleFiles, (files) => files.length > 0);

   const applyPagination = (files: DbFileMeta[]) => {
      if (!paginationState) return files;
      return files.slice(paginationState.offset, paginationState.offset + paginationState.limit);
   };

   const applySortByDate = (order: SortOrder) => {
      return [...fetchedFiles].sort((a, b) => {
         if (!a.lastViewedAt || !b.lastViewedAt) return 0;
         if (order === 'ASC') {
            return a.lastViewedAt.getTime() - b.lastViewedAt.getTime();
         }
         return b.lastViewedAt.getTime() - a.lastViewedAt.getTime();
      });
   };

   function fetchDocuments() {
      if (!paginationState) return;
      DB.getAllFilesMeta()
         .then((files) => {
            fetchedFiles = files;
            setVisibleFiles(applyPagination(applySortByDate(sorOrder)));
            usePaginationRequest.emit(files.length);
         })
         .catch((error) => {
            if (error instanceof NotInitError) {
               // console.warn(error);
            } else {
               Toast.error(error);
            }
         });
   }

   useDocumentsFetch.on(fetchDocuments);

   useDocumentsSort.on((order) => {
      sorOrder = order;
      setVisibleFiles(applyPagination(applySortByDate(sorOrder)));
   });

   usePaginationEvent.on((res) => {
      paginationState = res;
      fetchDocuments();
   });

   return elem(
      'div',
      classList(
         'flex',
         'items-center',
         'justify-center',
         'w-11/12',
         'mt-6',
         'mx-auto',
         'min-h-[320px]'
      ),
      ifElse(filesExist)(
         child(
            'ul',
            classList('flex', 'flex-wrap', 'items-center', 'w-full'),
            list(visibleFiles, (file) => {
               return DocumentCard(file);
            })
         )
      )(EmptyData("You don't have any files in cache:(", classList('mx-auto')))
   )();
};
