import { HTTPError } from 'ky';
import { useCallback, useMemo, useRef, useState } from 'react';
import useSWR from 'swr';
import { ISelected, ITableColumn, IToolbarFilter, useSelected } from '../../framework';
import { IView, useView } from '../../framework/useView';
import { ItemsResponse, getItemKey, swrOptions, useFetcher } from '../common/crud/Data';

export type IEdaView<T extends { id: number | string }> = IView &
  ISelected<T> & {
    itemCount: number | undefined;
    pageItems: T[] | undefined;
    refresh: () => Promise<ItemsResponse<T> | undefined>;
    selectItemsAndRefresh: (items: T[]) => void;
    unselectItemsAndRefresh: (items: T[]) => void;
    refreshing: boolean;
  };

export type QueryParams = {
  [key: string]: string;
};

function getQueryString(queryParams: QueryParams) {
  return Object.entries(queryParams)
    .map(([key, value = '']) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');
}

export function useEdaView<T extends { id: number | string }>(options: {
  url: string;
  viewPage?: number;
  viewPerPage?: number;
  toolbarFilters?: IToolbarFilter[];
  tableColumns?: ITableColumn<T>[];
  queryParams?: QueryParams;
  disableQueryString?: boolean;
  defaultSort?: string | undefined;
  defaultSortDirection?: 'asc' | 'desc' | undefined;
}): IEdaView<T> {
  let { url } = options;
  const { toolbarFilters, tableColumns, disableQueryString } = options;

  let defaultSort: string | undefined = options.defaultSort;
  let defaultSortDirection: 'asc' | 'desc' | undefined = options.defaultSortDirection;

  // If a column is defined with defaultSort:true use that column to set the default sort, otherwise use the first column
  if (tableColumns && tableColumns.length) {
    const defaultSortColumn = tableColumns.find((column) => column.defaultSort) ?? tableColumns[0];
    defaultSort = defaultSortColumn?.sort;
    defaultSortDirection = defaultSortColumn?.defaultSortDirection;
  }

  const view = useView(
    { sort: defaultSort, sortDirection: defaultSortDirection },
    disableQueryString
  );
  const itemCountRef = useRef<{ itemCount: number | undefined }>({ itemCount: undefined });

  const { page, perPage, sort, sortDirection, filters } = view;

  let queryString = options?.queryParams ? `?${getQueryString(options.queryParams)}` : '';

  if (filters) {
    for (const key in filters) {
      const toolbarFilter = toolbarFilters?.find((filter) => filter.key === key);
      if (toolbarFilter) {
        const values = filters[key];
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

  if (sort && !queryString.includes('order_by')) {
    queryString ? (queryString += '&') : (queryString += '?');
    if (sortDirection === 'desc') {
      queryString += `order_by=-${sort}`;
    } else {
      queryString += `order_by=${sort}`;
    }
  }

  queryString ? (queryString += '&') : (queryString += '?');
  queryString += `page=${options?.viewPage || page}`;

  queryString ? (queryString += '&') : (queryString += '?');
  queryString += `page_size=${options?.viewPerPage || perPage}`;

  url += queryString;
  const fetcher = useFetcher();
  const response = useSWR<ItemsResponse<T>>(url, fetcher, {
    ...swrOptions,
    refreshInterval: 10 * 1000,
  });
  const { data, mutate } = response;
  const [refreshing, setRefreshing] = useState(false);
  const refresh = useCallback(() => {
    setRefreshing(true);
    return mutate().finally(() => {
      setRefreshing(false);
    });
  }, [mutate]);

  useSWR<ItemsResponse<T>>(data?.next, fetcher, swrOptions);

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  let error: Error | undefined = response.error;
  if (error instanceof HTTPError) {
    if (error.response.status === 404 && view.page > 1) {
      view.setPage(1);
      error = undefined;
    }
  }

  const selection = useSelected(data?.results ?? [], getItemKey);

  if (data?.count !== undefined) {
    itemCountRef.current.itemCount = data?.count;
  }

  const selectItemsAndRefresh = useCallback(
    (items: T[]) => {
      selection.selectItems(items);
      void refresh();
    },
    [refresh, selection]
  );

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
      selectItemsAndRefresh,
      unselectItemsAndRefresh,
      refreshing,
    };
  }, [
    data?.results,
    error,
    refresh,
    refreshing,
    selectItemsAndRefresh,
    selection,
    unselectItemsAndRefresh,
    view,
  ]);
}
