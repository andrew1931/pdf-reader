import { ContentContainer } from '../components/ContentContainer';
import { EssentialLinks } from '../components/EssentialLinks';
import { H1, P } from '../components/Title';
import { Layout } from '../components/Layout';
import { LocalFileButton } from '../components/LocalFileButton';
import { DocumentsList } from '../components/DocumentsList';
import { Tab, Tabs } from '../components/Tabs';
import {
   useDocumentsFetch,
   useDocumentsSort,
   useDbInit,
   type SortOrder,
   usePaginationRequest,
} from '../core/hooks';
import { UrlPagination } from '../components/UrlPagination';
import { children, classList, elem, txt } from 'fundom.js';

export const DocumentsTitle = (orderBy: HTMLElement): HTMLElement => {
   return elem(
      'div',
      classList(
         'flex',
         'justify-center',
         'md:justify-between',
         'flex-col',
         'md:flex-row',
         'items-center',
         'py-3',
         'border-b',
         'border-slate-200',
         'w-11/12',
         'mx-auto'
      ),
      children(
         elem('h2', classList('subtitle', 'text-center', 'text-2xl'), txt('Viewed documents')),
         orderBy
      )
   )();
};

export const HomePage = (): HTMLElement => {
   const orderByKeys = {
      DESC: 'DESC',
      ASC: 'ASC',
   };
   const orderByTabs: Tab[] = [
      { label: 'Recently viewed', param: orderByKeys.DESC },
      { label: 'Lately viewed', param: orderByKeys.ASC },
   ];

   const orderBy = Tabs(orderByTabs);
   orderBy.target.classList.remove('mx-auto', 'md:mx-auto');
   orderBy.target.classList.add('md:my-auto', 'hidden');

   orderBy.onChange((value) => {
      useDocumentsSort.emit(value as SortOrder);
   });

   useDbInit.on(useDocumentsFetch.emit);

   usePaginationRequest.on((numberOfFiles) => {
      if (numberOfFiles > 1) {
         orderBy.target.classList.remove('hidden');
      } else {
         orderBy.target.classList.add('hidden');
      }
   });

   return Layout(
      ContentContainer(
         H1('Welcome to \n PDF reader'),
         P(
            'Choose a pdf document from your device \n using the button below to read it \n as a text only or as an original'
         ),
         EssentialLinks(),
         LocalFileButton(),
         DocumentsTitle(orderBy.target),
         DocumentsList(),
         UrlPagination()
      )
   );
};
