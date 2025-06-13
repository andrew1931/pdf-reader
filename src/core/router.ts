import { useRouterPush } from './hooks';
import { debounce, isTouchDevice } from './utils';

type Route = {
   path: string;
   component: () => HTMLElement;
};

type SideEffect = () => void;

let activeRoute = '';
let activeUrl = '';
let rootEl: HTMLElement | null = null;
let routesDefinition: Route[] = [];
const cachedComponents = new Map<string, HTMLElement>();
const navigationEnterEffects = new Map<string, SideEffect[]>();
const navigationLeaveEffects = new Map<string, SideEffect[]>();
const queryParamsChangeEffects = new Map<string, SideEffect[]>();

useRouterPush.on(handleRoute);

window.onpopstate = () => {
   handleQueryParamsEffects(activeUrl);
   useRouterPush.emit();
};

export const normalizedPath = (pathname?: string) => {
   const path = pathname || window.location.pathname;
   if (path !== '/' && path.endsWith('/')) {
      return path.slice(0, path.length - 1);
   }
   return path;
};

export const createRouter = (root: HTMLElement, routes: Route[]) => {
   rootEl = root;
   routesDefinition = routes;
   handleRoute();
};

export const Link = (url: string) => {
   const link = document.createElement('button');
   link.onclick = (e) => {
      e.preventDefault();
      navigate(url);
      link.blur();
   };
   return link;
};

export const updateSearchParams = (key: string, value: string): void => {
   const url = new URL(window.location.href);
   url.searchParams.set(key, value);
   navigate(url.toString());
};

export const getSearchParam = (key: string): string => {
   return new URLSearchParams(window.location.search).get(key) || '';
};

export const useNavigationEnter = (effect: SideEffect) => {
   setEffect(navigationEnterEffects, effect);
};

export const useNavigationLeave = (effect: SideEffect) => {
   setEffect(navigationLeaveEffects, effect);
};

export const useQueryParamsChange = (effect: SideEffect) => {
   setEffect(queryParamsChangeEffects, effect);
};

export const navigate = (url: string) => {
   const prevUrl = window.location.href;
   if (isTouchDevice()) {
      window.history.replaceState({}, '', url);
   } else {
      window.history.pushState({}, '', url);
   }
   useRouterPush.emit();
   handleQueryParamsEffects(prevUrl);
};

function setEffect(target: Map<string, SideEffect[]>, effect: SideEffect) {
   const key = normalizedPath();
   const current = target.get(key) || [];
   target.set(key, [...current, effect]);
}

function callEffects(target: Map<string, SideEffect[]>, pathname?: string) {
   const targetEffects = target.get(pathname || normalizedPath());
   if (targetEffects) {
      targetEffects.forEach((effect) => effect());
   }
}

const debouncedQueryEffect = debounce(callEffects);

function handleQueryParamsEffects(hrefBefore: string) {
   const urlBefore = new URL(hrefBefore);
   const urlAfter = new URL(window.location.href);
   const pathnameBefore = normalizedPath(urlBefore.pathname);
   const pathnameAfter = normalizedPath(urlAfter.pathname);
   const searchParamsBefore = new URLSearchParams(urlBefore.search);
   const searchParamsAfter = new URLSearchParams(urlAfter.search);

   if (pathnameBefore !== pathnameAfter) {
      return;
   }

   if (searchParamsAfter.size !== searchParamsBefore.size) {
      debouncedQueryEffect(queryParamsChangeEffects, '');
   } else {
      for (const [key, val] of searchParamsAfter.entries()) {
         if (searchParamsBefore.get(key) !== val) {
            debouncedQueryEffect(queryParamsChangeEffects, '');
            break;
         }
      }
   }
}

function handleRoute() {
   const pathname = normalizedPath();
   const prevRoute = activeRoute;
   activeUrl = window.location.href;
   let pageFound = false;
   if (rootEl === null) return;
   for (const route of routesDefinition) {
      const isTarget = normalizedPath(ROUTE_PREFIX + route.path) === pathname;
      if (isTarget) {
         if (!cachedComponents.has(pathname)) {
            const component = route.component();
            cachedComponents.set(pathname, component);
         }
         if (prevRoute && prevRoute !== pathname) {
            callEffects(navigationLeaveEffects, prevRoute);
         }
         if (activeRoute !== pathname) {
            activeRoute = pathname;
            rootEl.innerHTML = '';
            rootEl.appendChild(cachedComponents.get(pathname) as HTMLElement);
            callEffects(navigationEnterEffects, pathname);
         }
         pageFound = true;
         break;
      }
   }
   if (!pageFound) {
      if (prevRoute) {
         callEffects(navigationLeaveEffects, prevRoute);
      }
      rootEl.innerHTML = '';
      activeRoute = '*';
      const fallbackIndex = routesDefinition.findIndex((el) => el.path === '*');
      if (fallbackIndex > -1) {
         rootEl.appendChild(routesDefinition[fallbackIndex].component() as HTMLElement);
      }
   }
}
