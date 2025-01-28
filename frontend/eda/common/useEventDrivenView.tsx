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
import { getItemKey, swrOptions, useFetcher } from '@ansible/common-ui/crud/Data';
import { RequestError } from '@ansible/common-ui/crud/RequestError';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import useSWR from 'swr';
import { EdaItemsResponse } from './EdaItemsResponse';

export type IEdaView<T extends { id: number | string }> = IView &
  ISelected<T> & {
    itemCount: number | undefined;
    pageItems: T[] | undefined;
    refresh: () => Promise<void>;
    selectItemsAndRefresh: (items: T[]) => void;
    unselectItemsAndRefresh: (items: T[]) => void;
    updateItem: (item: T) => void;
  };

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
  defaultSelection?: T[];
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

  const view = useView({
    defaultValues: { sort: defaultSort, sortDirection: defaultSortDirection },
    disableQueryString,
  });
  const itemCountRef = useRef<{ itemCount: number | undefined }>({ itemCount: undefined });

  const queryString = buildQueryString(view, toolbarFilters || [], options.queryParams || {});

  url += queryString;
  const fetcher = useFetcher();
  const response = useSWR<EdaItemsResponse<T>>(url, fetcher, {
    ...swrOptions,
  });
  const { data, mutate } = response;
  const refresh = useCallback(async () => {
    await mutate().finally(() => {});
  }, [mutate]);

  useSWR<EdaItemsResponse<T>>(data?.next, fetcher, swrOptions);

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

  const [items, setItems] = useState<T[] | undefined>(undefined);

  useEffect(() => {
    setItems(data?.results);
  }, [data?.results]);

  const updateItem = useCallback(
    (item: T) => {
      if (!item) return;
      const index = items?.findIndex((i) => getItemKey(i) === getItemKey(item));
      if (index !== undefined && index !== -1) {
        const newItems = [...(items || [])];
        newItems[index] = item;
        setItems(newItems);
      }
    },
    [items]
  );

  return useMemo(() => {
    return {
      refresh,
      itemCount: itemCountRef.current.itemCount,
      pageItems: items,
      updateItem,
      error,
      ...view,
      ...selection,
      selectItemsAndRefresh,
      unselectItemsAndRefresh,
    };
  }, [
    items,
    updateItem,
    error,
    refresh,
    selectItemsAndRefresh,
    selection,
    unselectItemsAndRefresh,
    view,
  ]);
}
