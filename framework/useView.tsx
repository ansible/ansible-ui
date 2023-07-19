import { Dispatch, SetStateAction, useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

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
  filters: Record<string, string[]>;
  setFilters: Dispatch<SetStateAction<Record<string, string[]>>>;
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
 * It will load the dafulat values from the query string if they exist.
 * It will also update the query string when the values change.
 *
 * In most use cases, you will not need to use this hook directly.
 * Instead, you will use a wrapper hook that uses this hook.
 * That wrapper hook will be the hook that knows how to work with the data from the API.
 */
export function useView(options: {
  /**
   * The default values to use for the view
   * - filters
   * - sort
   * - sortDirection
   */
  defaultValues?: Partial<Pick<IView, 'filters' | 'sort' | 'sortDirection'>> | undefined;

  /**
   * Disable the use of query string parameters when using this view
   * - useful when there are two tables or a table in a modal
   */
  disableQueryString?: boolean;

  /** A list of query string keys to ignore when updating the query string å*/
  ignoreQueryStringKeys?: string[];

  /** A list of query string keys to filter out when updating the query string */
  filterQueryStringKeys?: string[];
}): IView {
  const { defaultValues, disableQueryString, ignoreQueryStringKeys, filterQueryStringKeys } =
    options;

  const [searchParams, setSearchParams] = useSearchParams();

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

  const [filters, setFilters] = useState<Record<string, string[]>>(() => {
    const filters: Record<string, string[]> = defaultValues?.filters ?? {};
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

  const clearAllFilters = useCallback(() => setFilters({}), [setFilters]);

  useEffect(() => {
    if (disableQueryString) return;
    setSearchParams((searchParams: URLSearchParams) => {
      const newSearchParams = new URLSearchParams(searchParams);
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
      for (const filter in filters) {
        newSearchParams.set(filter, filters[filter].join(','));
      }
      return newSearchParams;
    });
  }, [
    sort,
    sortDirection,
    setSearchParams,
    disableQueryString,
    page,
    perPage,
    filters,
    ignoreQueryStringKeys,
    filterQueryStringKeys,
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
      filters,
      setFilters,
      clearAllFilters,
    }),
    [clearAllFilters, filters, page, perPage, sort, sortDirection]
  );
}

/** Ignore these query string keys when updating the query string for filters */
const defaultIgnoreQueryStringKeys = ['page', 'perPage', 'sort'];
