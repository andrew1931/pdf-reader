import {
   attr,
   children,
   classList,
   cmp,
   elem,
   fmt,
   funState,
   ifOnly,
   list,
   on,
   style,
   txt,
} from 'fundom.js';
import { useWindowResize } from '../core/hooks';
import {
   getSearchParam,
   updateSearchParams,
   useNavigationEnter,
   useQueryParamsChange,
} from '../core/router';

export type Tab = {
   label: string;
   param: string;
};

export const Tabs = (tabList: Tab[], paramKey = '') => {
   const [getActiveTab, setActiveTab] = funState(tabList[0].param);
   const [getIndicatorOffset, setIndicatorOffset] = funState(0);

   const subscribers: ((value: string) => void)[] = [];
   const useUrl = paramKey.length > 0;
   const offsetPx = 3;
   const tabWidth = 'w-36';

   const activeIndex = () => tabList.findIndex((el) => el.param === getActiveTab());

   const tabItem = (item: Tab, index: number) => {
      return elem(
         'button',
         classList(
            'py-2',
            'px-4',
            'text-sm',
            'font-medium',
            'border-b-2',
            'border-transparent',
            'leading-loose',
            'z-10',
            'break-words',
            'overflow-hidden',
            'h-[44px]',
            tabWidth
         ),
         ifOnly(cmp(getActiveTab, () => index === activeIndex()))(classList('active-tab')),
         attr({ 'aria-label': 'Tab ' + item.label }),
         txt(item.label),
         on('click', function () {
            setActiveTab(item.param);
            if (useUrl) {
               updateSearchParams(paramKey, item.param);
            } else {
               setActiveTabStyle();
            }
            subscribers.forEach((cb) => cb(getActiveTab()));
            this.blur();
         })
      );
   };

   const activeIndicator = elem(
      'div',
      style({ left: fmt('{}px', getIndicatorOffset) }),
      classList(
         'tabs-active',
         'rounded-3xl',
         'absolute',
         'bottom-[3px]',
         'transition-[left]',
         'h-[38px]',
         tabWidth
      )
   )();

   const tabs = elem(
      'ul',
      classList(
         'tabs',
         'flex',
         'justify-center',
         'relative',
         'rounded-3xl',
         'mt-4',
         'mx-auto',
         'md:mx-auto',
         'md:mx-2',
         'px-[3px]',
         'overflow-hidden'
      ),
      children(activeIndicator),
      list(tabList, tabItem)
   )();

   function setActiveTabStyle() {
      if (!getActiveTab()) return;
      const targetIndex = activeIndex();
      if (targetIndex !== -1) {
         setIndicatorOffset(activeIndicator.clientWidth * targetIndex + offsetPx);
      }
   }

   function handleParams() {
      const activeTab = getSearchParam(paramKey);
      if (activeTab) {
         setActiveTab(activeTab);
         setActiveTabStyle();
      } else {
         updateSearchParams(paramKey, tabList[0].param);
      }
   }

   useNavigationEnter(() => {
      if (useUrl) {
         setTimeout(handleParams, 100);
      } else {
         setActiveTabStyle();
      }
   });

   useQueryParamsChange(() => {
      if (useUrl) {
         handleParams();
      }
   });

   useWindowResize.on(() => {
      if (useUrl) {
         const activeTab = getSearchParam(paramKey);
         if (activeTab) {
            setActiveTab(activeTab);
            setActiveTabStyle();
         }
      } else {
         setActiveTabStyle();
      }
   });

   return {
      target: tabs,
      onChange(cb: (val: string) => void) {
         subscribers.push(cb);
      },
   };
};
