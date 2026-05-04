import {
  ISelected,
  ITableColumn,
  IToolbarFilter,
  useSelected,
  QueryParams,
  buildQueryString,
} from '@ansible/ansible-ui-framework';
import { IView, useView } from '@ansible/ansible-ui-framework/useView';
import { getItemKey, swrOptions, useFetcher } from '@ansible/common-ui/crud/Data';
import { RequestError } from '@ansible/common-ui/crud/RequestError';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import useSWR from 'swr';
import { AwxItemsResponse } from './AwxItemsResponse';

export type IAwxView<T extends { id: number }> = IView &
  ISelected<T> & {
    itemCount: number | undefined;
    pageItems: T[] | undefined;
    refresh: () => Promise<void>;
    selectItemsAndRefresh: (items: T[]) => void;
    unselectItemsAndRefresh: (items: T[]) => void;
    limitFiltersToOneOrOperation: true;
    updateItem: (item: T) => void;
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

  const queryString = buildQueryString(view, toolbarFilters || [], queryParams || {});

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
    };
  }, [
    error,
    items,
    refresh,
    selectItemsAndRefresh,
    selection,
    unselectItemsAndRefresh,
    updateItem,
    view,
  ]);
}
