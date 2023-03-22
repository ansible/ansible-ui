import { HTTPError } from 'ky';
import { useCallback, useMemo, useRef, useState } from 'react';
import useSWR from 'swr';
import { ISelected, ITableColumn, IToolbarFilter, useSelected } from '../../framework';
import { IView, useView } from '../../framework/useView';
import { getItemKey, ItemsResponse, swrOptions, useFetcher } from '../common/crud/Data';

export type IAwxView<T extends { id: number }> = IView &
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

export function useAwxView<T extends { id: number }>(options: {
  /** The base url for the view. */
  url: string;

  /** The filters for the view. Used to manage the keys used in the brower querystrings which store the filter results. */
  toolbarFilters?: IToolbarFilter[];

  /** The table columns for the view. Used to determine the default sort. */
  tableColumns?: ITableColumn<T>[];

  /** Extra querystring params passed to the backed API.  */
  queryParams?: QueryParams;

  /** Disable the brower querystring updating. Used when a table is in a details page or modal. */
  disableQueryString?: boolean;

  /** The default items that should be initially selected. */
  defaultSelection?: T[];
}): IAwxView<T> {
  let { url } = options;
  const { toolbarFilters, tableColumns, disableQueryString } = options;

  let defaultSort: string | undefined = undefined;
  let defaultSortDirection: 'asc' | 'desc' | undefined = undefined;

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
  queryString += `page=${page}`;

  queryString ? (queryString += '&') : (queryString += '?');
  queryString += `page_size=${perPage}`;

  url += queryString;
  const fetcher = useFetcher();
  const response = useSWR<ItemsResponse<T>>(url, fetcher);
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

export async function getAwxError(err: unknown) {
  if (err instanceof HTTPError) {
    try {
      const response = (await err.response.json()) as { __all__?: string[] };
      if ('__all__' in response && Array.isArray(response.__all__)) {
        return JSON.stringify(response.__all__[0]);
      } else {
        return JSON.stringify(response);
      }
    } catch {
      return err.message;
    }
  } else if (err instanceof Error) {
    return err.message;
  } else {
    return 'unknown error';
  }
}
