/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import { useMemo, useState, useEffect } from 'react';

import {
  ISelected,
  ITableColumn,
  IToolbarFilter,
  IView,
  useSelected,
  useView,
  IFilterState,
} from '../../../framework';
import { postRequest } from '../../common/crud/Data';

import { RequestError } from '../../common/crud/RequestError';
import {
  AnalyticsReportBuilderBodyProps,
  computeMainFilterKeys,
} from './AnalyticsReportBuilder/AnalyticsReportBuilder';
import { DefaultDataParams } from './AnalyticsReportBuilder/AnalyticsReportBuilder';

export interface AnalyticsItemsResponse<T extends object> {
  meta: { count: number; legend: T[] };
}

export type QueryParams = {
  [key: string]: string;
};

export type IAnalyticsReportBuilderView<T extends object> = IView &
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

export function useAnalyticsReportBuilderView<T extends object>({
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
  disableLoading,
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
  builderProps?: AnalyticsReportBuilderBodyProps;
  sortableColumns?: string[];
  disableLoading?: boolean;
}): IAnalyticsReportBuilderView<T> {
  const [data, setData] = useState<AnalyticsItemsResponse<T> | undefined>(undefined);
  const [error, setError] = useState<any>(undefined);

  const postData = builderProps?.defaultDataParams || {};

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
    ignoreQueryStringKeys: ['reportName', 'chart_type'],
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

  // we cant only run fetch when url changes, but also when something in postData changes
  const postDataJson = JSON.stringify(postData);
  const changed = url + postDataJson;

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await postRequest(url, postData);
        setData(data);
      } catch (error) {
        setError(error);
      }
    }

    if (!disableLoading) {
      void (async () => {
        await fetchData();
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [changed, disableLoading]);

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
  }, [error, selection, view, data]);
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
            if (postData && postData[key] && Array.isArray(postData[key])) {
              // eslint-disable-next-line @typescript-eslint/no-unsafe-call
              postData[key].push(value);
            }
          }
        }
      }
    }
  }
}
