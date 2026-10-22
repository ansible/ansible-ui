import { IToolbarAsyncMultiSelectFilter } from '@ansible/ansible-ui-framework';
import {
  mergePageSelectOptions,
  PageAsyncSelectQueryOptions,
  PageAsyncSelectQueryResult,
} from '@ansible/ansible-ui-framework/PageInputs/PageAsyncSelectOptions';
import { PageSelectOption } from '@ansible/ansible-ui-framework/PageInputs/PageSelectOption';
import { MutableRefObject, useCallback, useEffect, useRef, useState } from 'react';
import { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';

/** Page size of the bulk loads ("Select all", "Invert selection"). */
export const BULK_PAGE_SIZE = 200;

/** The framework query options plus an optional page size, used by the bulk loads. */
export interface AutomationDashboardAsyncQueryOptions extends PageAsyncSelectQueryOptions {
  /** The page size to query; the query function's default page size when not set. */
  pageSize?: number;
}

/** The function to query a page of options; it accepts the framework query options as well. */
export type AutomationDashboardAsyncOptionsFn = (
  queryOptions: AutomationDashboardAsyncQueryOptions
) => Promise<PageAsyncSelectQueryResult<string>>;

/**
 * A dashboard async multi-select filter: its `queryOptions` takes the `pageSize` of the bulk
 * loads. A query that ignores it still loads every option, only with more requests, as the
 * remaining count is based on the options it returns. The dashboard select always sorts the
 * options by label and shows a spinner while loading, so the framework's `disableSortOptions`
 * and `queryPlaceholder` are not part of it.
 */
export interface AutomationDashboardAsyncFilter
  extends Omit<IToolbarAsyncMultiSelectFilter, 'disableSortOptions' | 'queryPlaceholder'> {
  queryOptions: AutomationDashboardAsyncOptionsFn;
}

interface AsyncOptionsState {
  options: PageSelectOption<string>[];
  loading: boolean;
  /** True while `loadAll` / `loadAllUnfiltered` load every option, also after the select closed. */
  loadingAll: boolean;
  /** No more pages to load ("Load more" is not needed). */
  allLoaded: boolean;
  /**
   * Every option is known to be loaded: no more pages, and as many options as the API reported
   * (pages that overlap miss some). Only then is the selection state of every option known.
   */
  isComplete: boolean;
  /** Loaded options plus the remaining count reported by the last query. */
  total: number;
  /** The search the shown options are (being) loaded for; undefined before the first load. */
  search?: string;
  /** The error of the last first page query; there are no options to use. */
  error?: Error;
  /** The error of the last "Load more"; the loaded options stay usable. */
  loadMoreError?: Error;
  /**
   * The error of the last `loadAll` / `loadAllUnfiltered`. It stays until the next bulk load or
   * until the select closes, also over a new search, as it may have failed while it was closed.
   */
  bulkError?: Error;
}

const INITIAL_STATE: AsyncOptionsState = {
  options: [],
  loading: false,
  loadingAll: false,
  allLoaded: false,
  isComplete: false,
  total: 0,
};

/**
 * Queries pages starting at `next` and merges them into `options` (unsorted: the select sorts
 * the shown options); with `untilAllLoaded` it keeps going until no options remain,
 * `BULK_PAGE_SIZE` options per page. Resolves with `undefined` when the signal was aborted.
 */
async function queryPages(
  queryOptions: AutomationDashboardAsyncOptionsFn,
  request: { search: string; signal: AbortSignal; untilAllLoaded?: boolean },
  start: { options: PageSelectOption<string>[]; next: number | string | undefined }
) {
  let { next } = start;
  const loaded: LoadedOptions = {
    options: [...start.options],
    values: new Set(start.options.map((option) => option.value)),
    newOptions: [],
    queriedValues: new Set(),
  };
  let remaining: number;
  let isProgressing: boolean;
  /** The count of options the API reported with the first page. */
  let reportedTotal: number | undefined;
  do {
    const result = await queryOptions({
      next: next!,
      signal: request.signal,
      search: request.search,
      pageSize: request.untilAllLoaded ? BULK_PAGE_SIZE : undefined,
    });
    if (request.signal.aborted) return undefined;
    reportedTotal ??= start.options.length + result.options.length + result.remaining;
    // The paging also ends when the API repeats the cursor or a page (e.g. a stale count), so
    // it cannot query forever.
    const pageHasNewValues = addPage(loaded, result.options);
    isProgressing = pageHasNewValues && !!result.next && result.next !== next;
    next = result.next;
    // An empty page ends the paging even if the API still reports remaining items.
    remaining = result.options.length > 0 ? result.remaining : 0;
  } while (request.untilAllLoaded && remaining > 0 && isProgressing);
  return { options: loaded.options, newOptions: loaded.newOptions, next, remaining, reportedTotal };
}

/** The options `queryPages` has loaded so far. */
interface LoadedOptions {
  /** Every option, appended in place: merging every page into a new array would make a bulk load of many pages quadratic. */
  options: PageSelectOption<string>[];
  values: Set<string>;
  /** The options added by this call, in order. */
  newOptions: PageSelectOption<string>[];
  /** Values of the pages queried by this call, to notice a page that brings nothing new. */
  queriedValues: Set<string>;
}

/** Adds the options of a page that are not loaded yet; returns whether the page was new. */
function addPage(loaded: LoadedOptions, page: PageSelectOption<string>[]) {
  let pageHasNewValues = false;
  for (const option of page) {
    if (!loaded.queriedValues.has(option.value)) pageHasNewValues = true;
    loaded.queriedValues.add(option.value);
    if (loaded.values.has(option.value)) continue;
    loaded.values.add(option.value);
    loaded.options.push(option);
    loaded.newOptions.push(option);
  }
  return pageHasNewValues;
}

/** The state without the load errors, which are shown only while the select is open. */
function withoutErrors(prev: AsyncOptionsState): AsyncOptionsState {
  if (!prev.error && !prev.loadMoreError && !prev.bulkError) return prev;
  return { ...prev, error: undefined, loadMoreError: undefined, bulkError: undefined };
}

/** The state without the error of a bulk load, e.g. when a later bulk load starts. */
function withoutBulkError(prev: AsyncOptionsState): AsyncOptionsState {
  return prev.bulkError ? { ...prev, bulkError: undefined } : prev;
}

/** The state of a closed select: no errors and no shown options (loaded again when it opens). */
function closedState(prev: AsyncOptionsState): AsyncOptionsState {
  return {
    ...withoutErrors(prev),
    options: [],
    search: undefined,
    allLoaded: false,
    isComplete: false,
    total: 0,
  };
}

/** The state while a page loads for `search` (a reset load starts without a total). */
function loadingPageState(
  prev: AsyncOptionsState,
  options: PageSelectOption<string>[],
  search: string,
  reset: boolean
): AsyncOptionsState {
  return {
    ...prev,
    options,
    total: reset ? 0 : prev.total,
    search,
    loading: true,
    allLoaded: false,
    isComplete: false,
    error: undefined,
    loadMoreError: undefined,
  };
}

/** The state update once every option is loaded (and checked to be complete) by a bulk load. */
function everyOptionState(options: PageSelectOption<string>[]): Partial<AsyncOptionsState> {
  return { options, allLoaded: true, isComplete: true, total: options.length };
}

/** Aborts the running query in `abortRef` and returns the controller for a new one. */
function startQuery(abortRef: MutableRefObject<AbortController | null>) {
  abortRef.current?.abort();
  abortRef.current = new AbortController();
  return abortRef.current;
}

/** The error of a failed query, as an `Error`. */
function toError(err: unknown, t: TFunction) {
  return err instanceof Error ? err : new Error(t('Unknown error'));
}

/** A ref that always holds the value of the latest render. */
function useLatestRef<T>(value: T) {
  const ref = useRef(value);
  ref.current = value;
  return ref;
}

/** The error of a bulk load that could not load every option (its message tells so). */
export class IncompleteOptionsError extends Error {}

/**
 * Queries every option for `search` with `BULK_PAGE_SIZE`. Resolves with `undefined` when the
 * signal was aborted and rejects with an `IncompleteOptionsError` (`incompleteMessage`) when not
 * every option is loaded, as a bulk action must not use a partial list: the API stopped paging
 * (e.g. a repeated page), or the pages held fewer distinct options than the API reported (pages
 * that overlap, e.g. ordered by names that are not unique).
 */
async function queryEveryOption(
  queryOptions: AutomationDashboardAsyncOptionsFn,
  search: string,
  signal: AbortSignal,
  incompleteMessage: string
) {
  const result = await queryPages(
    queryOptions,
    { search, signal, untilAllLoaded: true },
    { options: [], next: undefined }
  );
  if (!result) return undefined;
  if (result.remaining > 0 || result.options.length < (result.reportedTotal ?? 0)) {
    throw new IncompleteOptionsError(incompleteMessage);
  }
  return result.options;
}

/**
 * Pages through `queryOptions` for the dashboard async multi-select. Loads the first page while
 * the select is open (again whenever the search changes) and aborts that query when it closes.
 * `loadAll` resolves with every option for the search and `loadAllUnfiltered` with every option
 * regardless of the search. These bulk loads keep running when the select closes, so the bulk
 * action that started them still completes; they are only aborted on unmount (e.g. when another
 * filter is selected). Both resolve with `undefined` if the load was aborted or failed (the error
 * is then in `bulkError`), also when the API stops paging before every option is loaded. The
 * options of every search are kept while the select is open, so "Invert selection" loads them
 * only once.
 */
export function useAutomationDashboardAsyncOptions(
  queryOptionsFn: AutomationDashboardAsyncOptionsFn,
  search: string,
  isOpen: boolean,
  /** Called with the newly loaded options whenever options are loaded (shown or by a bulk load). */
  onOptionsLoaded?: (options: PageSelectOption<string>[]) => void
) {
  const { t } = useTranslation();
  const [state, setState] = useState<AsyncOptionsState>(INITIAL_STATE);

  // Callers pass a new closure each render: the latest one is called through a ref, so the
  // loads stay stable (a new `load` would reload the first page) and never use an outdated one.
  const queryOptionsRef = useLatestRef(queryOptionsFn);
  const onOptionsLoadedRef = useLatestRef(onOptionsLoaded);
  const queryOptions = useCallback<AutomationDashboardAsyncOptionsFn>(
    (query) => queryOptionsRef.current(query),
    [queryOptionsRef]
  );
  const optionsRef = useRef<PageSelectOption<string>[]>([]);
  const nextRef = useRef<number | string | undefined>();
  const allLoadedRef = useRef(false);
  /** The search the options in `optionsRef` were loaded for. */
  const loadedSearchRef = useRef<string>();
  /** Counts the resets of the shown options, so a bulk load only adds to the ones it started on. */
  const resetCountRef = useRef(0);
  /** Every option regardless of the search, once loaded while the select is open. */
  const unfilteredRef = useRef<PageSelectOption<string>[]>();
  const pageAbortRef = useRef<AbortController | null>(null);
  const bulkAbortRef = useRef<AbortController | null>(null);

  /** Drops the shown options; the next ones are loaded for `search` (none: not loading). */
  const resetShownOptions = useCallback((search?: string) => {
    optionsRef.current = [];
    nextRef.current = undefined;
    allLoadedRef.current = false;
    loadedSearchRef.current = search;
    resetCountRef.current += 1;
  }, []);

  const loadPage = useCallback(
    async (request: { reset?: boolean } = {}) => {
      // Options of another search (the search changed before the reset load ran) are dropped.
      const reset = request.reset || loadedSearchRef.current !== search;
      const controller = startQuery(pageAbortRef);
      if (reset) resetShownOptions(search);
      setState((prev) => loadingPageState(prev, optionsRef.current, search, reset));
      try {
        const result = await queryPages(
          queryOptions,
          { search, signal: controller.signal },
          { options: optionsRef.current, next: nextRef.current }
        );
        if (!result) {
          // An aborted query that was not replaced by a newer one (e.g. the select closed)
          // clears the loading flag; a newer query sets it itself.
          if (pageAbortRef.current === controller) {
            setState((prev) => ({ ...prev, loading: false }));
          }
          return;
        }
        // A bulk load that finished meanwhile loaded every option of this search already.
        if (!reset && allLoadedRef.current && loadedSearchRef.current === search) {
          setState((prev) => ({ ...prev, loading: false }));
          return;
        }
        const { remaining } = result;
        optionsRef.current = result.options;
        nextRef.current = result.next;
        // The bulk actions use the loaded options only when the pages held as many options as the
        // API reported: pages that overlap (e.g. ordered by names that are not unique) miss some.
        allLoadedRef.current = !remaining && result.options.length >= (result.reportedTotal ?? 0);
        // Only the new options: reporting every loaded option on each page would be quadratic.
        onOptionsLoadedRef.current?.(result.newOptions);
        if (!search && allLoadedRef.current) unfilteredRef.current = optionsRef.current;
        setState((prev) => ({
          ...prev,
          options: optionsRef.current,
          search,
          loading: false,
          allLoaded: !remaining,
          isComplete: allLoadedRef.current,
          total: remaining + optionsRef.current.length,
        }));
      } catch (err) {
        if (controller.signal.aborted) {
          if (pageAbortRef.current === controller) {
            setState((prev) => ({ ...prev, loading: false }));
          }
          return;
        }
        // Only a failed first page leaves no options to show.
        const error = toError(err, t);
        setState((prev) => ({
          ...prev,
          loading: false,
          ...(reset ? { error } : { loadMoreError: error }),
        }));
      }
    },
    [onOptionsLoadedRef, queryOptions, resetShownOptions, search, t]
  );

  /** Loads every option for `bulkSearch` with `BULK_PAGE_SIZE`; see the hook description. */
  const loadBulk = useCallback(
    async (bulkSearch: string) => {
      // Clears the error of an earlier bulk load, also when the loaded options are used.
      setState(withoutBulkError);
      if (loadedSearchRef.current === bulkSearch && allLoadedRef.current) return optionsRef.current;
      if (!bulkSearch && unfilteredRef.current) return unfilteredRef.current;
      const controller = startQuery(bulkAbortRef);
      const resetCount = resetCountRef.current;
      /** Ends this bulk load with `update`, unless a newer bulk load replaced it. */
      const end = (update: Partial<AsyncOptionsState> = {}) => {
        if (bulkAbortRef.current !== controller) return;
        setState((prev) => ({ ...prev, loadingAll: false, ...update }));
      };
      setState((prev) => ({ ...prev, loadingAll: true }));
      try {
        const options = await queryEveryOption(
          queryOptions,
          bulkSearch,
          controller.signal,
          t('Not every option could be loaded.')
        );
        if (!options) {
          end();
          return undefined;
        }
        onOptionsLoadedRef.current?.(options);
        if (!bulkSearch) unfilteredRef.current = options;
        // The options are also shown when the select still shows the options of this search.
        if (loadedSearchRef.current !== bulkSearch || resetCountRef.current !== resetCount) {
          end();
          return options;
        }
        // The freshly loaded options first, so their labels win (e.g. a renamed option).
        optionsRef.current = mergePageSelectOptions(options, optionsRef.current, false);
        allLoadedRef.current = true;
        end(everyOptionState(optionsRef.current));
        return options;
      } catch (err) {
        end(controller.signal.aborted ? {} : { bulkError: toError(err, t) });
        return undefined;
      }
    },
    [onOptionsLoadedRef, queryOptions, t]
  );

  useEffect(() => {
    if (!isOpen) {
      pageAbortRef.current?.abort();
      return;
    }
    // A new search's reset load aborts the running page query itself.
    void loadPage({ reset: true });
  }, [isOpen, loadPage]);

  // The unfiltered options are kept while the select is open. When it closes, the errors shown
  // while it was open are cleared, and so are the shown options: the first page is loaded again
  // when it opens, so it never shows the options of the previous search meanwhile.
  useEffect(() => {
    if (isOpen) {
      unfilteredRef.current = undefined;
      return;
    }
    resetShownOptions();
    setState(closedState);
  }, [isOpen, resetShownOptions]);

  // A bulk load only outlives the select, not the component.
  useEffect(
    () => () => {
      pageAbortRef.current?.abort();
      bulkAbortRef.current?.abort();
    },
    []
  );

  const loadMore = useCallback(() => void loadPage(), [loadPage]);
  const reload = useCallback(() => void loadPage({ reset: true }), [loadPage]);
  const loadAll = useCallback(() => loadBulk(search), [loadBulk, search]);
  const loadAllUnfiltered = useCallback(() => loadBulk(''), [loadBulk]);
  /** Aborts the running bulk load; `loadAll` / `loadAllUnfiltered` resolve with `undefined`. */
  const cancelBulk = useCallback(() => {
    if (!bulkAbortRef.current) return;
    bulkAbortRef.current.abort();
    bulkAbortRef.current = null;
    setState((prev) => ({ ...prev, loadingAll: false }));
  }, []);

  return { ...state, loadMore, reload, loadAll, loadAllUnfiltered, cancelBulk };
}
