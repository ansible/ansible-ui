import { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import useSWR from 'swr';
import {
  ISelected,
  ITableColumn,
  IToolbarFilter,
  IView,
  useSelected,
  useView,
  IFilterState,
} from '../../../framework';
import { postRequest, usePostFetcher } from '../../common/crud/Data';

import { RequestError } from '../../common/crud/RequestError';
import { AnalyticsBodyProps, computeMainFilterKeys } from './AnalyticsBuilder/AnalyticsBuilder';
import { DefaultDataParams } from './AnalyticsBuilder/AnalyticsBuilder';

export interface AnalyticsItemsResponse<T extends object> {
  meta: { count: number; legend: T[] };
}

export type QueryParams = {
  [key: string]: string;
};

export type IAnalyticsBuilderView<T extends object> = IView &
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

/*
function computeAvailableFilterKeys(builderProps: AnalyticsBodyProps)
{
  const keys = computeMainFilterKeys(builderProps);
  keys.push('quick_date_range');
  return keys;
}*/

export function useAnalyticsBuilderView<T extends object>({
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
  builderProps?: AnalyticsBodyProps;
  sortableColumns?: string[];
}): IAnalyticsBuilderView<T> {
  const [data, setData] = useState<AnalyticsItemsResponse<T> | undefined>(undefined);
  const [error, setError] = useState<any>(undefined);

  let postData = builderProps?.defaultDataParams || {};

  // clear all params that are not in filters
  if (builderProps) {
    const availableFilterKeys = computeMainFilterKeys(builderProps).map((item) => item.key);
    for (const key of availableFilterKeys) {
      if (postData[key]) {
        if (Array.isArray(postData[key])) {
          postData[key] = [];
        }
      }
    }
  }

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

  const { page, perPage, sort, sortDirection, filterState } = view;

  let queryString = queryParams ? `?${getQueryString(queryParams)}` : '';

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

  fillFilters(postData, filterState, toolbarFilters || []);

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

  // we cant only run fetch when url changes, but also when something in postData changes
  const postDataJson = JSON.stringify(postData);
  const changed = url + postDataJson;

  useEffect(() => {
    fetchData();
  }, [changed]);

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  if (error instanceof RequestError) {
    if (error.statusCode === 404 && view.page > 1) {
      view.setPage(1);
      setError(undefined);
    }
  }

  const selection = useSelected(data?.meta.legend ?? [], keyFn, defaultSelection);

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

export function fillFilters(
  postData: DefaultDataParams,
  filterState: IFilterState,
  toolbarFilters: IToolbarFilter[]
) {
  if (filterState) {
    for (const key in filterState) {
      const toolbarFilter = toolbarFilters?.find((filter) => filter.key === key);
      if (toolbarFilter) {
        const values = filterState[key];

        if (!values || values.length == 0) {
          continue;
        }

        if (!Array.isArray(postData[key])) {
          postData[key] = values[0];
        } else {
          for (const value of values) {
            postData[key].push(value);
          }
        }
      }
    }
  }
}
