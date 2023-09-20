import { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import useSWR from 'swr';
import {
  ISelected,
  ITableColumn,
  IToolbarFilter,
  IView,
  useSelected,
  useView,
} from '../../../framework';
import { postRequest, usePostFetcher } from '../../common/crud/Data';

import { RequestError } from '../../common/crud/RequestError';
import { AnalyticsBuilderProps } from './AnalyticsBuilder/AnalyticsBuilder';

export interface AnalyticsItemsResponse<T extends object> {
  meta: { count: number; legend: T[] };
}

export type QueryParams = {
  [key: string]: string;
};

export type IAnalyticsView<T extends object> = IView &
  ISelected<T> & {
    itemCount: number | undefined;
    pageItems: T[] | undefined;
    originalData: undefined;
  };

export function getQueryString(queryParams: QueryParams) {
  return Object.entries(queryParams)
    .map(([key, value = '']) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');
}

export function useAnalyticsView<T extends object>({
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
  builderProps,
  sortableColumns,
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
  builderProps?: AnalyticsBuilderProps;
  sortableColumns?: string[];
}): IAnalyticsView<T> {
  const [data, setData] = useState<AnalyticsItemsResponse<T> | undefined>(undefined);
  const [error, setError] = useState<any>(undefined);

  let postData = builderProps?.defaultDataParams || {};
  builderProps?.processDataRequestPayload?.(builderProps, postData);

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

  //const itemCountRef = useRef<{ itemCount: number | undefined }>({ itemCount: undefined });

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
    let canSort = tableColumns?.find((item) => item.sort == sort) ? true : false;

    if (!canSort) {
      // try sortableColumns instead if table columns not defined
      canSort = sortableColumns?.find((item) => item == sort) ? true : false;
    }

    if (canSort) {
      if (!sortKey) {
        sortKey = 'sort_by';
      }
      queryString ? (queryString += '&') : (queryString += '?');
      if (sortDirection === 'desc') {
        queryString += `${sortKey}=${sort}:desc`;
      } else {
        queryString += `${sortKey}=${sort}:asc`;
      }
    }
  }

  queryString ? (queryString += '&') : (queryString += '?');
  queryString += `offset=${(page - 1) * perPage}`;

  queryString ? (queryString += '&') : (queryString += '?');
  queryString += `limit=${perPage}`;

  url += queryString;

  async function fetchData() {
    try {
      const data = (await postRequest(url, postData)) as AnalyticsItemsResponse<T>;
      setData(data);
    } catch (error) {
      setError(error);
    }
  }

  useEffect(() => {
    fetchData();
  }, [url]);

  //const fetcher = usePostFetcher();
  /*const response = useSWR<AnalyticsItemsResponse<T>>(url, fetcher, {
    dedupingInterval: 0,
    refreshInterval: 30000,
  });*/

  /*const { data, mutate } = response;
  const refresh = useCallback(async () => {
    await mutate();
  }, [mutate]);*/

  // refresh probably not needed
  /*const nextPage = data?.links?.next;
  useSWR<AnalyticsItemsResponse<T>>(nextPage, fetcher, {
    dedupingInterval: 0,
  });*/

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  if (error instanceof RequestError) {
    if (error.statusCode === 404 && view.page > 1) {
      view.setPage(1);
      setError(undefined);
    }
  }

  const selection = useSelected(data?.meta.legend ?? [], keyFn, defaultSelection);

  /*if (data?.meta.legend.length !== undefined) {
    itemCountRef.current.itemCount = data?.meta.legend.length;
  }*/

  /*const unselectItemsAndRefresh = useCallback(
    (items: T[]) => {
      selection.unselectItems(items);
      void refresh();
    },
    [refresh, selection]
  );*/

  /*
  return useMemo(() => {
    return {
      refresh,
      itemCount: data?.meta.count,
      pageItems: data?.meta.legend,
      error,
      ...view,
      ...selection,
      unselectItemsAndRefresh,
      originalData: data as undefined,
    };
  }, [data?.meta.legend, error, refresh, selection, unselectItemsAndRefresh, view, data]);
  */

  return useMemo(() => {
    return {
      itemCount: data?.meta.count,
      pageItems: data?.meta.legend,
      error,
      ...view,
      ...selection,
      originalData: data as undefined,
    };
  }, [data?.meta.legend, error, selection, view, data]);
}

export function getAwxError(err: unknown) {
  if (err instanceof RequestError) {
    try {
      const response = err.json as { __all__?: string[] };
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
