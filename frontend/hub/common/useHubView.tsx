import { useCallback, useMemo, useRef } from 'react';
import useSWR from 'swr';
import {
  ISelected,
  ITableColumn,
  IToolbarFilter,
  IView,
  useSelected,
  useView,
} from '../../../framework';
import { useFetcher } from '../../common/crud/Data';
import { RequestError } from '../../common/crud/RequestError';
import { QueryParams, getQueryString, serverlessURL } from './api/hub-api-utils';

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
    itemCount: number | undefined;
    pageItems: T[] | undefined;
    refresh: () => Promise<void>;
    unselectItemsAndRefresh: (items: T[]) => void;
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

const sortKeys = {
  '/pulp/api/v3/': 'ordering',
  '/pulp/api/v3/pulp_container/namespaces/': 'sort',
  '/v1/imports/': 'order_by',
  '/v1/roles/': 'order_by',
  '/_ui/v1/': 'sort',
  '/v3/plugin/ansible/search/collection-versions/': 'order_by',
};

const pageKeys = {
  '/v1/imports/': 'page',
  '/v1/namespaces/': 'page',
  '/v1/roles/': 'page',
  '/_ui/v1/': 'offset',
};

function url2keys(url: string): { sortKey: string; pageKey: string } {
  let sortKey = 'sort';
  Object.entries(sortKeys).forEach(([k, v]) => {
    if (url.includes(k)) {
      sortKey = v;
    }
  });

  let pageKey = 'offset';
  Object.entries(pageKeys).forEach(([k, v]) => {
    if (url.includes(k)) {
      pageKey = v;
    }
  });

  return { pageKey, sortKey };
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

  const { pageKey, sortKey } = url2keys(url);

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
