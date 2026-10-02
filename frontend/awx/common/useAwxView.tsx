import {
  ISelected,
  ITableColumn,
  IToolbarFilter,
  useSelected,
  QueryParams,
  buildQueryString,
} from '@ansible/ansible-ui-framework';
import { IView, useView } from '@ansible/ansible-ui-framework/useView';
import { getItemKey, useFetcher } from '@ansible/common-ui/crud/Data';
import { RequestError } from '@ansible/common-ui/crud/RequestError';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import useSWR from 'swr';
import { AwxItemsResponse } from './AwxItemsResponse';
import { useAwxConfigState } from './useAwxConfig';

export function compareByField<T>(
  a: T,
  b: T,
  key: string,
  direction: 'asc' | 'desc' = 'asc'
): number {
  const aVal = (a as Record<string, unknown>)[key];
  const bVal = (b as Record<string, unknown>)[key];
  if (aVal === null || aVal === undefined || bVal === null || bVal === undefined) return 0;

  let cmp: number;
  if (typeof aVal === 'string' && typeof bVal === 'string') {
    cmp = aVal.localeCompare(bVal, undefined, { sensitivity: 'base' });
  } else if (aVal < bVal) {
    cmp = -1;
  } else if (aVal > bVal) {
    cmp = 1;
  } else {
    cmp = 0;
  }

  return direction === 'desc' ? -cmp : cmp;
}

export type IAwxView<T extends { id: number }> = IView &
  ISelected<T> & {
    itemCount: number | undefined;
    pageItems: T[] | undefined;
    error: Error | undefined;
    refresh: () => Promise<void>;
    selectItemsAndRefresh: (items: T[]) => void;
    unselectItemsAndRefresh: (items: T[]) => void;
    limitFiltersToOneOrOperation: true;
    updateItem: (item: T) => void;
    /** Insert or update an item in the local items state. New items are inserted in sort order. */
    upsertItem: (item: T) => void;
    /** The current fully-qualified list URL including query string (filters, sort, pagination). */
    listUrl: string;
  };

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
  defaultFilters?: { [key: string]: string[] };
  ignoreQueryStringKeys?: string[];
}): IAwxView<T> {
  let { url } = options;
  const { toolbarFilters, tableColumns, disableQueryString, queryParams } = options;

  let defaultSort: string | undefined = options.defaultSort;
  let defaultSortDirection: 'asc' | 'desc' | undefined = options.defaultSortDirection;

  // If a column is defined with defaultSort:true use that column to set the default sort, otherwise use the first column
  if (tableColumns?.length) {
    const defaultSortColumn = tableColumns.find((column) => column.defaultSort) ?? tableColumns[0];
    defaultSort = defaultSortColumn?.sort;
    defaultSortDirection = defaultSortColumn?.defaultSortDirection;
  }

  const view = useView({
    defaultValues: {
      sort: defaultSort,
      sortDirection: defaultSortDirection,
      filterState: options.defaultFilters,
    },
    disableQueryString,
    ignoreQueryStringKeys: options.ignoreQueryStringKeys,
  });
  const itemCountRef = useRef<{ itemCount: number | undefined }>({ itemCount: undefined });

  const { serviceDown, serviceDownStatusCode } = useAwxConfigState();

  const serviceDownError = useMemo(() => {
    if (!serviceDown) return undefined;
    const message = serviceDownStatusCode
      ? `Controller service is unavailable (HTTP ${String(serviceDownStatusCode)})`
      : 'Controller service is unavailable';
    return new Error(message);
  }, [serviceDown, serviceDownStatusCode]);

  const queryString = buildQueryString(view, toolbarFilters || [], queryParams || {});

  url += queryString;
  const fetcher = useFetcher();
  const response = useSWR<AwxItemsResponse<T>>(serviceDown ? null : url, fetcher);
  const { data, mutate } = response;
  const refresh = useCallback(async () => {
    await mutate().finally(() => {});
  }, [mutate]);

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  let error: Error | undefined = response.error;
  if (serviceDown) {
    error = serviceDownError;
  } else if (error instanceof RequestError) {
    if ((error.statusCode === 404 || error.statusCode === 400) && view.page > 1) {
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

  const [items, setItems] = useState<T[] | undefined>(undefined);
  useEffect(() => {
    setItems(data?.results);
  }, [data?.results]);

  const updateItem = useCallback(
    (item: T) => {
      if (!items) return;
      const index = items?.findIndex((i) => i.id === item.id);
      if (index !== -1) {
        const newItems = [...items];
        newItems[index] = item;
        setItems(newItems);
      }
    },
    [items]
  );

  const upsertItem = useCallback(
    (item: T) => {
      if (!items) return;
      const index = items.findIndex((i) => i.id === item.id);
      if (index === -1) {
        const newItems = [item, ...items];
        if (view.sort) {
          const key = view.sort;
          const dir = view.sortDirection ?? 'asc';
          newItems.sort((a, b) => compareByField(a, b, key, dir));
        }
        setItems(newItems);
      } else {
        const newItems = [...items];
        newItems[index] = item;
        setItems(newItems);
      }
    },
    [items, view.sort, view.sortDirection]
  );

  return useMemo(() => {
    return {
      refresh,
      itemCount: itemCountRef.current.itemCount,
      pageItems: items,
      error,
      ...view,
      ...selection,
      selectItemsAndRefresh,
      unselectItemsAndRefresh,
      limitFiltersToOneOrOperation: true,
      updateItem,
      upsertItem,
      listUrl: url,
    };
  }, [
    error,
    items,
    refresh,
    selectItemsAndRefresh,
    selection,
    unselectItemsAndRefresh,
    updateItem,
    upsertItem,
    url,
    view,
  ]);
}
