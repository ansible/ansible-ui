import { HTTPError } from 'ky';
import { useCallback, useMemo, useRef } from 'react';
import useSWR from 'swr';
import {
  ISelected,
  ITableColumn,
  IToolbarFilter,
  IView,
  useSelected,
  useView,
} from '../../framework';
import { useFetcher } from '../common/crud/Data';
import { QueryParams, getQueryString, serverlessURL } from './api';

export interface PulpSearchItemsResponse<T> {
  count: number;
  next?: string | null;
  previous?: string | null;
  results: T[];
}

export type IHubView<T extends object> = IView &
  ISelected<T> & {
    itemCount: number | undefined;
    pageItems: T[] | undefined;
    refresh: () => Promise<PulpSearchItemsResponse<T> | undefined>;
    unselectItemsAndRefresh: (items: T[]) => void;
  };

export function usePulpSearchView<T extends object>({
  url,
  keyFn,
  toolbarFilters,
  tableColumns,
  disableQueryString,
  queryParams,
  sortKey,
  defaultFilters,
}: {
  url: string;
  keyFn: (item: T) => string | number;
  toolbarFilters?: IToolbarFilter[];
  tableColumns?: ITableColumn<T>[];
  disableQueryString?: boolean;
  queryParams?: QueryParams;
  sortKey?: string;
  defaultFilters?: Record<string, string[]>;
}): IHubView<T> {
  const view = useView({
    defaultValues: {
      sort: tableColumns && tableColumns.length ? tableColumns[0].sort : undefined,
      filterState: defaultFilters,
    },
    disableQueryString,
  });
  const itemCountRef = useRef<{ itemCount: number | undefined }>({ itemCount: undefined });

  const { page, perPage, sort, sortDirection, filterState } = view;

  let queryString = queryParams ? `?${getQueryString(queryParams)}` : '';

  if (filterState) {
    for (const key in filterState) {
      const toolbarFilter = toolbarFilters?.find((filter) => filter.key === key);
      if (toolbarFilter) {
        const values = filterState[key];
        if (values.length > 0) {
          queryString ? (queryString += '&') : (queryString += '?');
          if (values.length > 1) {
            queryString += values.map((value) => `or__${toolbarFilter.query}=${value}`).join('&');
          } else {
            queryString += `${toolbarFilter.query}=${values.join(',')}`;
          }
        }
      }
    }
  }

  if (sort) {
    if (!sortKey) {
      sortKey = 'sort';
    }
    queryString ? (queryString += '&') : (queryString += '?');
    if (sortDirection === 'desc') {
      queryString += `${sortKey}=-${sort}`;
    } else {
      queryString += `${sortKey}=${sort}`;
    }
  }

  queryString ? (queryString += '&') : (queryString += '?');
  queryString += `offset=${(page - 1) * perPage}`;

  queryString ? (queryString += '&') : (queryString += '?');
  queryString += `limit=${perPage}`;

  url += queryString;
  const fetcher = useFetcher();
  const response = useSWR<PulpSearchItemsResponse<T>>(url, fetcher, {
    dedupingInterval: 0,
    refreshInterval: 30000,
  });
  const { data, mutate } = response;
  const refresh = useCallback(() => mutate(), [mutate]);

  const nextPage = serverlessURL(data?.next);
  useSWR<PulpSearchItemsResponse<T>>(nextPage, fetcher, {
    dedupingInterval: 0,
  });

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  let error: Error | undefined = response.error;
  if (error instanceof HTTPError) {
    if (error.response.status === 404 && view.page > 1) {
      view.setPage(1);
      error = undefined;
    }
  }

  const selection = useSelected(data?.results ?? [], keyFn);

  if (data?.count !== undefined) {
    itemCountRef.current.itemCount = data?.count;
  }

  const unselectItemsAndRefresh = useCallback(
    (items: T[]) => {
      selection.unselectItems(items);
      void refresh();
    },
    [refresh, selection]
  );

  return useMemo(() => {
    return {
      refresh,
      itemCount: itemCountRef.current.itemCount,
      pageItems: data?.results,
      error,
      ...view,
      ...selection,
      unselectItemsAndRefresh,
    };
  }, [data?.results, error, refresh, selection, unselectItemsAndRefresh, view]);
}
