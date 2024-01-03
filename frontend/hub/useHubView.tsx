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

export interface PulpItemsResponse<T extends object> {
  count: number;
  results: T[];
  next?: string;
}

interface CommonResponse<T extends object> {
  count: number | undefined;
  next: string | undefined;
  pageItems: T[] | undefined;
}

interface IHubViewParams<T extends object> {
  defaultFilters?: Record<string, string[]>;
  defaultSelection?: T[];
  defaultSort?: string | undefined;
  defaultSortDirection?: 'asc' | 'desc' | undefined;
  disableQueryString?: boolean;
  keyFn: (item: T) => string | number;
  pageKey?: string;
  queryParams?: QueryParams;
  sortKey?: string;
  tableColumns?: ITableColumn<T>[];
  toolbarFilters?: IToolbarFilter[];
  url: string;
}

export type IHubView<T extends object> = IView &
  ISelected<T> & {
    itemCount: number | undefined;
    pageItems: T[] | undefined;
    refresh: () => Promise<void>;
    unselectItemsAndRefresh: (items: T[]) => void;
  };

export function useCommonView<T extends object, Response>({
  deconstruct,
  defaultFilters,
  defaultSelection,
  defaultSort: initialDefaultSort,
  defaultSortDirection: initialDefaultSortDirection,
  disableQueryString,
  keyFn,
  pageKey = 'offset',
  queryParams,
  sortKey,
  tableColumns,
  toolbarFilters,
  url,
}: IHubViewParams<T> & {
  deconstruct: (data: Response) => CommonResponse<T>;
  sortKey: string;
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

  const queryString = queryParams ? [getQueryString(queryParams)] : [];

  if (filterState) {
    for (const key in filterState) {
      const toolbarFilter = toolbarFilters?.find((filter) => filter.key === key);
      if (toolbarFilter) {
        const values = filterState[key];
        if (values && values.length > 0) {
          if (values.length > 1) {
            // FIXME: this doesn't seem to be something hub api supports yet - is it useful anywhere specific?
            queryString.push(
              values.map((value) => `or__${toolbarFilter.query}=${value}`).join('&')
            );
          } else {
            queryString.push(`${toolbarFilter.query}=${values.join(',')}`);
          }
        }
      }
    }
  }

  if (sort) {
    if (sortDirection === 'desc') {
      queryString.push(`${sortKey}=-${sort}`);
    } else {
      queryString.push(`${sortKey}=${sort}`);
    }
  }

  if (pageKey === 'offset') {
    queryString.push(`offset=${(page - 1) * perPage}`);
    queryString.push(`limit=${perPage}`);
  } else if (pageKey === 'page') {
    queryString.push(`page=${page}`);
    queryString.push(`page_size=${perPage}`);
  }

  if (queryString.length) {
    url += '?' + queryString.join('&');
  }

  const fetcher = useFetcher();
  const response = useSWR<Response>(url, fetcher, {
    dedupingInterval: 0,
    refreshInterval: 30000,
  });
  const { data, mutate } = response;
  const refresh = useCallback(async () => {
    await mutate();
  }, [mutate]);

  const { count, next, pageItems } = deconstruct(data as Response);

  const nextPage = serverlessURL(next);
  useSWR<Response>(nextPage, fetcher, {
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

  return useMemo(() => {
    return {
      refresh,
      itemCount: itemCountRef.current.itemCount,
      pageItems,
      error,
      ...view,
      ...selection,
      unselectItemsAndRefresh,
    };
  }, [error, pageItems, refresh, selection, unselectItemsAndRefresh, view]);
}

export function useHubView<T extends object>(params: IHubViewParams<T>): IHubView<T> {
  return useCommonView<T, HubItemsResponse<T>>({
    sortKey: 'sort',
    ...params,
    deconstruct: (data: HubItemsResponse<T>): CommonResponse<T> => {
      const {
        data: pageItems,
        meta: { count },
        links: { next },
      } = data || {
        links: {},
        meta: {},
      };
      return {
        count,
        next,
        pageItems,
      };
    },
  });
}

export function usePulpView<T extends object>(params: IHubViewParams<T>): IHubView<T> {
  return useCommonView<T, PulpItemsResponse<T>>({
    sortKey: 'ordering',
    ...params,
    deconstruct: (data: PulpItemsResponse<T>): CommonResponse<T> => {
      const { results: pageItems, count, next } = data || {};
      return {
        count,
        next,
        pageItems,
      };
    },
  });
}
