/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable react-hooks/exhaustive-deps */
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
import { postRequest, requestGet } from '../../common/crud/Data';

import { RequestError } from '../../common/crud/RequestError';
import {
  AnalyticsReportBuilderBodyProps,
  computeMainFilterKeys,
} from './AnalyticsReportBuilder/AnalyticsReportBuilder';
import { DefaultDataParams } from './AnalyticsReportBuilder/AnalyticsReportBuilder';
import { AnyType } from './AnalyticsReportBuilder/AnalyticsReportBuilder';

export interface AnalyticsItemsResponse<T extends object> {
  meta: { count: number; legend: T[] };
}

export type QueryParams = {
  [key: string]: string;
};

export type IAnalyticsReportBuilderView<
  T extends object,
  DataType extends object = AnyType,
> = IView &
  ISelected<T> & {
    // max number of items in db - important for paging
    itemCount: number | undefined;
    // actual items returned for table
    pageItems: T[] | undefined;

    // original data returned from request
    originalData: DataType;
  };

export function getQueryString(queryParams: QueryParams) {
  return Object.entries(queryParams)
    .map(([key, value = '']) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');
}
/*
 T is type of actual array T[] that is returned and serves as data for PageTable
 DataType is type that is returned from the request - inside of it is list of actual items returned
 but every request has it differently.

 There are callback functions like getItems, you pass a function that has input the data returned from request
 and returns array T[] that is actual list of items for Page Table. The same is for getItemsCount 
*/
export function useAnalyticsView<T extends object, DataType extends object = AnyType>({
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
  payload,
  sortableColumns,
  disableLoading,
  getItems,
  getItemsCount,
  requestMethod,
  itemsPerPage,
}: {
  // url of request
  url: string;

  // unique key of each row,
  keyFn: (item: T) => string | number;

  // pass the same toolbarFilters object that is passed to pageTable
  toolbarFilters?: IToolbarFilter[];

  // pass the same tableColumns object that is passed to pageTable
  tableColumns?: ITableColumn<T>[];

  disableQueryString?: boolean;
  queryParams?: QueryParams;
  sortKey?: string;
  defaultFilters?: Record<string, string[]>;
  defaultSort?: string | undefined;
  defaultSortDirection?: 'asc' | 'desc' | undefined;
  defaultSelection?: T[];

  // this is unique for AnalyticsReportBuilder
  builderProps?: AnalyticsReportBuilderBodyProps;

  // which columns are sortable
  sortableColumns?: string[];
  disableLoading?: boolean;

  // for requests that needs payload data such as post
  payload?: AnyType;

  // which request will be used, in future, we may add another if needed
  requestMethod: 'post' | 'get';

  /*  returns list of items - every request can have it differently
      
      for example (also getItemsCount described below)
      this is valid for ReportBuilder request:
      
      getItemsCount : (data) => data?.meta.count,
      getItems : (data) => data?.meta.legend,
  */
  getItems: (data: DataType) => T[];

  // returns count of all items in database for the request, that servers for paging
  getItemsCount: (data: DataType) => number;
  itemsPerPage?: number;
}): IAnalyticsReportBuilderView<T> {
  const [data, setData] = useState<AnalyticsItemsResponse<T> | undefined>(undefined);
  const [error, setError] = useState<any>(undefined);

  const payloadData = builderProps?.defaultDataParams || payload || {};

  // clear all params that are not in filters, usage for ReportBuilder
  if (builderProps) {
    const availableFilterKeys = computeMainFilterKeys(builderProps).map((item) => item.key);
    for (const key of availableFilterKeys) {
      if (payloadData[key]) {
        if (Array.isArray(payloadData[key])) {
          payloadData[key] = [];
        }
      }
    }
  }

  builderProps?.processDataRequestPayload?.(builderProps, payloadData);

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
    let canSort = tableColumns?.find((item) => item.sort === sort) ? true : false;

    if (!canSort) {
      // try sortableColumns instead if table columns not defined
      canSort = sortableColumns?.find((item) => item === sort) ? true : false;
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

  fillFilters(payloadData, filterState, toolbarFilters || []);

  queryString ? (queryString += '&') : (queryString += '?');
  itemsPerPage
    ? (queryString += `offset=${(page - 1) * itemsPerPage}`)
    : (queryString += `offset=${(page - 1) * perPage}`);

  queryString ? (queryString += '&') : (queryString += '?');
  itemsPerPage ? (queryString += `limit=${itemsPerPage}`) : (queryString += `limit=${perPage}`);

  url += queryString;

  // we cant only run fetch when url changes, but also when something in payloadData changes
  const payloadDataJson = JSON.stringify(payloadData || {});
  const changed = url + payloadDataJson;

  useEffect(() => {
    async function fetchData() {
      try {
        let data = null;

        if (requestMethod === 'post') {
          data = await postRequest(url, payloadData);
        }

        if (requestMethod === 'get') {
          data = await requestGet(url);
        }

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
      itemCount: data ? getItemsCount(data) : 0,
      pageItems: data ? getItems(data) : [],
      error,
      ...view,
      ...selection,
      originalData: data as undefined,
    };
  }, [error, selection, view, data]);
}

export function fillFilters(
  payloadData: DefaultDataParams,
  filterState: IFilterState,
  toolbarFilters: IToolbarFilter[]
) {
  if (filterState) {
    for (const key in filterState) {
      const toolbarFilter = toolbarFilters?.find((filter) => filter.key === key);
      if (toolbarFilter) {
        const values = filterState[key];

        if (!values || values.length === 0) {
          continue;
        }

        if (!Array.isArray(payloadData[key])) {
          payloadData[key] = values[0];
        } else {
          for (const value of values) {
            if (payloadData && payloadData[key] && Array.isArray(payloadData[key])) {
              // eslint-disable-next-line @typescript-eslint/no-unsafe-call
              payloadData[key].push(value);
            }
          }
        }
      }
    }
  }
}
