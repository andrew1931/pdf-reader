type ToggleHTMLProps = { skippedElement?: HTMLElement, value: boolean };

type UnsubscribeFn = () => void;

export type PaginationEvent = { limit: number; offset: number };

export type SortOrder = "DESC" | "ASC";

export type EmitHook<T> = (data: T) => void;

export type OnHook<T> = (cb: (data: T) => void) => UnsubscribeFn;

const EVENTS = {
    ROUTER_PUSH_STATE: "ROUTER_PUSH_STATE",
    DB_INIT: "DB_INIT",
    CHANGE_DOC_PAGE: "CHANGE_DOC_PAGE",
    TOGGLE_THEME: "TOGGLE_THEME",
    UPDATE_PAGE: "UPDATE_PAGE",
    TOGGLE_SCROLL: "TOGGLE_SCROLL",
    TOGGLE_OUTLINE: "TOGGLE_OUTLINE",
    WINDOW_RESIZE: "WINDOW_RESIZE",
    FETCH_DOCUMENTS: "FETCH_DOCUMENTS",
    SORT_DOCUMENTS: "SORT_DOCUMENTS",
    DOCUMENTS_RESPONSE: "DOCUMENTS_RESPONSE",
    PAGINATION_EVENT: "PAGINATION_EVENT",
    PAGINATION_REQUEST: "PAGINATION_REQUEST",
};

const EventEmitter = (() => {
    return {
        emit<T>(event: string, props?: T): void {
            document.dispatchEvent(new CustomEvent(event, { detail: props }));
        },
        on<T>(event: string, cb: (e: T) => void): UnsubscribeFn {
            const fn = (e) => { cb(e.detail); };
            document.addEventListener(event, fn, false);
            return () => {
                document.removeEventListener(event, fn);
            };
        }
    };
})();

const createHook = <T>(event: string): { on: OnHook<T>, emit: EmitHook<T> } => {
    const emitHook: EmitHook<T> = (value) => {
        return EventEmitter.emit<T>(event, value);
    };
    const onHook: OnHook<T> = (cb) => {
        return EventEmitter.on<T>(event, cb);
    };
    return {
        on: onHook,
        emit: emitHook
    };
};

export const useWindowResize = createHook<void>(EVENTS.WINDOW_RESIZE);

export const useRouterPush = createHook<void>(EVENTS.ROUTER_PUSH_STATE);

export const useDbInit = createHook<void>(EVENTS.DB_INIT);

export const useThemeToggle = createHook<void>(EVENTS.TOGGLE_THEME);

export const usePageUpdate = createHook<void>(EVENTS.UPDATE_PAGE);

export const useDocumentPageChange = createHook<number>(EVENTS.CHANGE_DOC_PAGE);

export const useScrollToggle = createHook<ToggleHTMLProps>(EVENTS.TOGGLE_SCROLL);

export const useOutlineToggle = createHook<ToggleHTMLProps>(EVENTS.TOGGLE_OUTLINE);

export const useDocumentsFetch = createHook<void>(EVENTS.FETCH_DOCUMENTS);

export const useDocumentsSort = createHook<SortOrder>(EVENTS.SORT_DOCUMENTS);

export const usePaginationEvent = createHook<PaginationEvent>(EVENTS.PAGINATION_EVENT);

export const usePaginationRequest = createHook<number>(EVENTS.PAGINATION_REQUEST);



