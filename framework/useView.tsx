import { Dispatch, SetStateAction, useCallback, useEffect, useMemo, useState } from 'react';
import { IFilterState } from './PageToolbar/PageToolbarFilter';
import { useIsMountedRef } from './components/useIsMounted';
import { useURLSearchParams } from './components/useURLSearchParams';
import { useWindowLocation } from './components/useWindowLocation';

import { ITableColumn, IToolbarFilter } from '../framework';

/**
 * The IView interface defines the state for a table.
 *
 * It includes:
 * - pagination
 * - sorting
 * - filters
 */
export interface IView {
  page: number;
  setPage: (page: number) => void;
  perPage: number;
  setPerPage: (perPage: number) => void;
  sort: string;
  setSort: (sort: string) => void;
  sortDirection: 'asc' | 'desc';
  setSortDirection: (sortDirection: 'asc' | 'desc') => void;
  filterState: IFilterState;
  setFilterState: Dispatch<SetStateAction<IFilterState>>;
  clearAllFilters: () => void;
}

/**
 * The useView hook manages the state for tables.
 *
 * This includes:
 * - page
 * - perPage
 * - sort
 * - sortDirection
 * - filters
 *
 * It also manages the query string parameters for the table.
 * It will load the default values from the query string if they exist.
 * It will also update the query string when the values change.
 *
 * In most use cases, you will not need to use this hook directly.
 * Instead, you will use a wrapper hook that uses this hook.
 * That wrapper hook will be the hook that knows how to work with the data from the API.
 */

export interface ViewOptions {
  /**
   * The default values to use for the view
   * - filters
   * - sort
   * - sortDirection
   */
  defaultValues?: Partial<Pick<IView, 'filterState' | 'sort' | 'sortDirection'>> | undefined;

  /**
   * Disable the use of query string parameters when using this view
   * - useful when there are two tables or a table in a modal
   */
  disableQueryString?: boolean;

  /**
   * An array of query string keys to ignore when updating the query string for filters.
   * This is the opposite of filterQueryStringKeys and only one should be used.
   *
   * Example:
   *   if ignoreQueryStringKeys=['abc'] then clearing filters would not clear 'abc' from the query string
   *   this would allow pages to have querystring values that are not cleared by filters.
   */
  ignoreQueryStringKeys?: string[];

  /**
   * An array of query string keys that represent the filter state in the query string.
   * This is the opposite of ignoreQueryStringKeys and only one should be used.
   *
   * This is useful when the filters are known up front.
   * In most of the framework, the filter keys are known up front and can be passed in,
   * utilizing this option.
   */
  filterQueryStringKeys?: string[];
}

export type QueryParams = {
  [key: string]: string | string[];
};

export interface ViewExtendedOptions<T extends object> extends ViewOptions {
  url: string;
  keyFn: (item: T) => string | number;
  toolbarFilters?: IToolbarFilter[];
  tableColumns?: ITableColumn<T>[];
  disableQueryString?: boolean;
  queryParams?: QueryParams;
  sortKey?: string;
  defaultFilters?: Record<string, string[]>;
}

export function useView(options: ViewOptions): IView {
  const { defaultValues, disableQueryString, ignoreQueryStringKeys, filterQueryStringKeys } =
    options;

  const mountedRef = useIsMountedRef();

  const [searchParams, setSearchParams] = useURLSearchParams();

  const [page, setPage] = useState(() => {
    if (!disableQueryString) {
      const queryPage = searchParams.get('page');
      if (queryPage) {
        const page = Number(queryPage);
        if (Number.isInteger(page)) {
          return page;
        }
      }
    }
    return 1;
  });

  const [perPage, setPerPage] = useState(() => {
    if (!disableQueryString) {
      const queryPerPage = searchParams.get('perPage');
      if (queryPerPage) {
        const perPage = Number(queryPerPage);
        if (Number.isInteger(perPage)) {
          return perPage;
        }
      }
    }
    const localPerPage = localStorage.getItem('perPage');
    if (localPerPage) {
      const perPage = Number(localPerPage);
      if (Number.isInteger(perPage)) {
        return perPage;
      }
    }
    return 10;
  });

  const [sort, setSort] = useState(() => {
    if (!disableQueryString) {
      const querySort = searchParams.get('sort');
      if (querySort) {
        if (querySort.startsWith('-')) return querySort.slice(1);
        return querySort;
      }
    }
    return defaultValues?.sort ?? '';
  });

  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(() => {
    if (!disableQueryString) {
      const querySort = searchParams.get('sort');
      if (querySort) {
        if (querySort.startsWith('-')) return 'desc';
        return 'asc';
      }
    }
    return defaultValues?.sortDirection ?? 'asc';
  });

  const [filterState, setFilterState] = useState<IFilterState>(() => {
    const filters: IFilterState = defaultValues?.filterState ?? {};
    for (const key of searchParams.keys()) {
      if (defaultIgnoreQueryStringKeys.includes(key)) continue;
      const value = searchParams.get(key);
      if (value) {
        const values = value.split(',');
        filters[key] = values;
      }
    }
    return filters;
  });

  const clearAllFilters = useCallback(() => setFilterState({}), [setFilterState]);

  const location = useWindowLocation();

  useEffect(() => {
    if (disableQueryString) return;
    /** Cypress component tests add a specPath param that must be ignored */
    let search = location.location?.search;
    if (search && search.includes('?specPath=')) {
      search = search.substring(0, search.indexOf('?specPath='));
    } else if (search && search.includes('&specPath=')) {
      search = search.substring(0, search.indexOf('&specPath='));
    }
    const newSearchParams = new URLSearchParams(search ?? '/');
    newSearchParams.set('page', page.toString());
    newSearchParams.set('perPage', perPage.toString());
    newSearchParams.set('sort', sortDirection === 'asc' ? sort : `-${sort}`);

    // Remove all query string keys that are for filters
    for (const key of searchParams.keys()) {
      if (defaultIgnoreQueryStringKeys.includes(key)) continue;
      if (ignoreQueryStringKeys?.includes(key)) continue;
      if (filterQueryStringKeys) {
        if (filterQueryStringKeys.includes(key)) {
          newSearchParams.delete(key);
        }
        continue;
      }
      newSearchParams.delete(key);
    }

    // For each filter with value, add it to the query string
    for (const filter in filterState) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      newSearchParams.set(filter, filterState[filter]!.join(','));
    }

    setSearchParams(newSearchParams);
  }, [
    sort,
    sortDirection,
    setSearchParams,
    disableQueryString,
    page,
    perPage,
    filterState,
    ignoreQueryStringKeys,
    filterQueryStringKeys,
    mountedRef,
    searchParams,
    location.location?.search,
  ]);

  useEffect(() => {
    localStorage.setItem('perPage', perPage.toString());
  }, [perPage]);

  return useMemo(
    () => ({
      page,
      setPage,
      perPage,
      setPerPage,
      sort,
      setSort,
      sortDirection,
      setSortDirection,
      filterState,
      setFilterState,
      clearAllFilters,
    }),
    [clearAllFilters, filterState, page, perPage, sort, sortDirection]
  );
}

/** Ignore these query string keys when updating the query string for filters */
const defaultIgnoreQueryStringKeys = ['page', 'perPage', 'sort'];
