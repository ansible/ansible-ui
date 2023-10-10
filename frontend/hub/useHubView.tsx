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
import { QueryParams, getQueryString, serverlessURL } from './api/utils';
import { RequestError } from '../common/crud/RequestError';

export interface HubItemsResponse<T extends object> {
  meta: {
    count: number;
  };
  data: T[];
  links: {
    next?: string;
  };
}

export type IHubView<T extends object> = IView &
  ISelected<T> & {
    itemCount: number | undefined;
    pageItems: T[] | undefined;
    refresh: () => Promise<void>;
    unselectItemsAndRefresh: (items: T[]) => void;
  };

export function useHubView<T extends object>({
  url,
  keyFn,
  toolbarFilters,
  tableColumns,
  disableQueryString,
  queryParams,
  sortKey,
  defaultFilters,
  defaultSort: initialDefaultSort,
  defaultSortDirection: initialDefaultSortDirection,
  defaultSelection,
}: {
  url: string;
  keyFn: (item: T) => string | number;
  toolbarFilters?: IToolbarFilter[];
  tableColumns?: ITableColumn<T>[];
  disableQueryString?: boolean;
  queryParams?: QueryParams;
  sortKey?: string;
  defaultFilters?: Record<string, string[]>;
  defaultSort?: string | undefined;
  defaultSortDirection?: 'asc' | 'desc' | undefined;
  defaultSelection?: T[];
}): IHubView<T> {
  let defaultSort: string | undefined = initialDefaultSort;
  let defaultSortDirection: 'asc' | 'desc' | undefined = initialDefaultSortDirection;

  // If a column is defined with defaultSort:true use that column to set the default sort, otherwise use the first column
  if (tableColumns && tableColumns.length) {
    const defaultSortColumn = tableColumns.find((column) => column.defaultSort) ?? tableColumns[0];
    defaultSort = defaultSortColumn?.sort;
    defaultSortDirection = defaultSortColumn?.defaultSortDirection;
  }

  const view = useView({
    defaultValues: {
      sort: defaultSort,
      sortDirection: defaultSortDirection,
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
        if (values && values.length > 0) {
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
  const response = useSWR<HubItemsResponse<T>>(url, fetcher, {
    dedupingInterval: 0,
    refreshInterval: 30000,
  });
  const { data, mutate } = response;
  const refresh = useCallback(async () => {
    await mutate();
  }, [mutate]);

  const nextPage = serverlessURL(data?.links?.next);
  useSWR<HubItemsResponse<T>>(nextPage, fetcher, {
    dedupingInterval: 0,
  });

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  let error: Error | undefined = response.error;
  if (error instanceof RequestError) {
    if (error.statusCode === 404 && view.page > 1) {
      view.setPage(1);
      error = undefined;
    }
  }

  const selection = useSelected(data?.data ?? [], keyFn, defaultSelection);

  if (data?.meta.count !== undefined) {
    itemCountRef.current.itemCount = data?.meta.count;
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
      pageItems: data?.data,
      error,
      ...view,
      ...selection,
      unselectItemsAndRefresh,
    };
  }, [data?.data, error, refresh, selection, unselectItemsAndRefresh, view]);
}
