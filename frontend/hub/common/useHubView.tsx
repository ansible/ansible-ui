import {
  ISelected,
  ITableColumn,
  IToolbarFilter,
  IView,
  useSelected,
  useView,
  QueryParams,
  buildQueryString,
} from '@ansible/ansible-ui-framework';
import { useFetcher } from '@ansible/common-ui/crud/Data';
import { RequestError } from '@ansible/common-ui/crud/RequestError';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import useSWR from 'swr';
import { serverlessURL } from './api/hub-api-utils';
import { url2keys } from './api/query-string';
import { isInsightsMode } from './isInsights';

export interface HubItemsResponse<T extends object> {
  meta: {
    count: number;
  };
  data: T[];
  links: {
    next?: string;
  };
}

export interface PulpItemsResponse<T extends object> {
  count: number;
  results: T[];
  next?: string;
}

export type IHubView<T extends object> = IView &
  ISelected<T> & {
    error: Error | undefined;
    itemCount: number | undefined;
    pageItems: T[] | undefined;
    refresh: () => Promise<void>;
    unselectItemsAndRefresh: (items: T[]) => void;
    updateItem: (item: T) => void;
  };

interface CommonResponse<T extends object> {
  count: number | undefined;
  next: string | undefined;
  pageItems: T[] | undefined;
}

function deconstruct<T extends object>(
  data: HubItemsResponse<T> | PulpItemsResponse<T> | undefined
): CommonResponse<T> {
  if (data && 'meta' in data) {
    // HubItemsResponse
    return {
      count: data.meta.count,
      next: data.links?.next,
      pageItems: data.data,
    };
  } else {
    // PulpItemsResponse | undefined
    return {
      count: data?.count,
      next: data?.next,
      pageItems: data?.results,
    };
  }
}

export function useHubView<T extends object>({
  defaultFilters,
  defaultSelection,
  defaultSort: initialDefaultSort,
  defaultSortDirection: initialDefaultSortDirection,
  disableQueryString,
  keyFn,
  queryParams,
  tableColumns,
  toolbarFilters,
  url,
}: {
  defaultFilters?: Record<string, string[]>;
  defaultSelection?: T[];
  defaultSort?: string | undefined;
  defaultSortDirection?: 'asc' | 'desc' | undefined;
  disableQueryString?: boolean;
  keyFn: (item: T) => string | number;
  queryParams?: QueryParams;
  tableColumns?: ITableColumn<T>[];
  toolbarFilters?: IToolbarFilter[];
  url: string;
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
    // Disable query string in Insights mode to avoid URL path conflicts with Chrome's router
    disableQueryString: disableQueryString || isInsightsMode(),
  });
  const itemCountRef = useRef<{ itemCount: number | undefined }>({ itemCount: undefined });

  const { page, perPage, sort, sortDirection } = view;

  const queryString = buildQueryString(view, toolbarFilters || [], queryParams || {});

  const { pageKey, sortKey } = url2keys(url);

  // adjust sort & pagination params if needed
  const params = new URLSearchParams(queryString);
  if (sort && sortKey !== 'order_by') {
    params.delete('order_by');
    params.append(sortKey, sortDirection === 'desc' ? `-${sort}` : sort);
  }
  if (pageKey === 'offset') {
    params.delete('page');
    params.delete('page_size');
    params.append('offset', `${(page - 1) * perPage}`);
    params.append('limit', perPage.toString());
  }

  if (params.size) {
    url += '?' + params.toString();
  }

  const fetcher = useFetcher();
  const response = useSWR<HubItemsResponse<T> | PulpItemsResponse<T>>(url, fetcher, {
    dedupingInterval: 0,
  });
  const { data, mutate } = response;
  const refresh = useCallback(async () => {
    await mutate();
  }, [mutate]);

  const { count, next, pageItems } = deconstruct<T>(data);

  const nextPage = serverlessURL(next);
  useSWR<HubItemsResponse<T> | PulpItemsResponse<T>>(nextPage, fetcher, {
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

  const selection = useSelected(pageItems ?? [], keyFn, defaultSelection);

  if (count !== undefined) {
    itemCountRef.current.itemCount = count;
  }

  const unselectItemsAndRefresh = useCallback(
    (items: T[]) => {
      selection.unselectItems(items);
      void refresh();
    },
    [refresh, selection]
  );

  const [items, setItems] = useState<T[] | undefined>(undefined);

  useEffect(() => {
    setItems(pageItems);
  }, [pageItems]);

  const updateItem = useCallback(
    (item: T) => {
      if (items) {
        const index = items.findIndex((i) => keyFn(i) === keyFn(item));
        if (index !== -1) {
          const newItems = [...items];
          newItems[index] = item;
          setItems(newItems);
        }
      }
    },
    [items, keyFn]
  );

  return useMemo(() => {
    return {
      refresh,
      updateItem,
      itemCount: itemCountRef.current.itemCount,
      pageItems: items,
      error,
      ...view,
      ...selection,
      unselectItemsAndRefresh,
    };
  }, [error, refresh, selection, unselectItemsAndRefresh, items, view, updateItem]);
}
