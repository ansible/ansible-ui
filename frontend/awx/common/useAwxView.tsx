import { useCallback, useMemo, useRef } from 'react';
import useSWR from 'swr';
import { ISelected, ITableColumn, IToolbarFilter, useSelected } from '../../../framework';
import { IView, useView } from '../../../framework/useView';
import { getItemKey, swrOptions, useFetcher } from '../../common/crud/Data';
import { RequestError } from '../../common/crud/RequestError';
import { AwxItemsResponse } from './AwxItemsResponse';

export type IAwxView<T extends { id: number }> = IView &
  ISelected<T> & {
    itemCount: number | undefined;
    pageItems: T[] | undefined;
    refresh: () => Promise<void>;
    selectItemsAndRefresh: (items: T[]) => void;
    unselectItemsAndRefresh: (items: T[]) => void;
  };

export type QueryParams = {
  [key: string]: string;
};

function getQueryString(queryParams: QueryParams) {
  return Object.entries(queryParams)
    .map(([key, value = '']) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');
}

export function useAwxView<T extends { id: number }>(options: {
  /** The base url for the view. */
  url: string;

  /** The filters for the view. Used to manage the keys used in the browser querystrings which store the filter results. */
  toolbarFilters?: IToolbarFilter[];

  /** The table columns for the view. Used to determine the default sort. */
  tableColumns?: ITableColumn<T>[];

  /** Extra querystring params passed to the backed API.  */
  queryParams?: QueryParams;

  /** Disable the browser querystring updating. Used when a table is in a details page or modal. */
  disableQueryString?: boolean;

  /** The default items that should be initially selected. */
  defaultSelection?: T[];

  defaultSort?: string | undefined;
  defaultSortDirection?: 'asc' | 'desc' | undefined;
}): IAwxView<T> {
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

  const view = useView({
    defaultValues: { sort: defaultSort, sortDirection: defaultSortDirection },
    disableQueryString,
  });
  const itemCountRef = useRef<{ itemCount: number | undefined }>({ itemCount: undefined });

  const { page, perPage, sort, sortDirection, filterState } = view;

  let queryString = options?.queryParams ? `?${getQueryString(options.queryParams)}` : '';

  if (filterState) {
    for (const key in filterState) {
      const toolbarFilter = toolbarFilters?.find((filter) => filter.key === key);
      if (toolbarFilter) {
        const values = filterState[key];
        if (values && values.length > 0) {
          queryString ? (queryString += '&') : (queryString += '?');

          // Support for Activity Stream needing two values
          if (toolbarFilter.query === 'object1__in') {
            if (values.length === 1 && values.some((value) => value !== '')) {
              queryString += `or__object1__in=${values[0]
                .split('+')
                .join(',')}&or__object2__in=${values[0].split('+').join(',')}`;
            }
          } else if (toolbarFilter.query === 'search') {
            queryString += values.map((value) => `${toolbarFilter.query}=${value}`).join('&');
          } else {
            if (values.length > 1) {
              queryString += values.map((value) => `or__${toolbarFilter.query}=${value}`).join('&');
            } else {
              queryString += `${toolbarFilter.query}=${values[0]}`;
            }
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
  queryString += `page=${page}`;

  queryString ? (queryString += '&') : (queryString += '?');
  queryString += `page_size=${perPage}`;

  url += queryString;
  const fetcher = useFetcher();
  const response = useSWR<AwxItemsResponse<T>>(url, fetcher, swrOptions);
  const { data, mutate } = response;
  const refresh = useCallback(async () => {
    await mutate().finally(() => {});
  }, [mutate]);

  useSWR<AwxItemsResponse<T>>(data?.next, fetcher, swrOptions);

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  let error: Error | undefined = response.error;
  if (error instanceof RequestError) {
    if (error.statusCode === 404 && view.page > 1) {
      view.setPage(1);
      error = undefined;
    }
  }

  const selection = useSelected(data?.results ?? [], getItemKey, options.defaultSelection);

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
    };
  }, [
    data?.results,
    error,
    refresh,
    selectItemsAndRefresh,
    selection,
    unselectItemsAndRefresh,
    view,
  ]);
}
