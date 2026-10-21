import { IToolbarFilter, QueryParams, useView, IView } from '@ansible/ansible-ui-framework';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useFetcher } from '@ansible/common-ui/crud/Data';
import useSWR from 'swr';
import { AwxItemsResponse } from '../../../common/AwxItemsResponse';
import { RequestError } from '../../../../common/crud/RequestError';
import { getQueryString, hasValidRequiredFilters } from '../utils/queryString';

export type IAutomationDashboardBaseView<T extends { id: number }> = IView & {
  itemCount: number | undefined;
  pageItems: T[] | undefined;
  refresh: () => Promise<void>;
  limitFiltersToOneOrOperation: true;
  updateItem: (item: T) => void;
  error: Error | undefined;
};

export function useAutomationDashboardBaseView<T extends { id: number }>(options: {
  /** The base url for the view. */
  url: string;

  /** The filters for the view. Used to manage the keys used in the browser querystrings which store the filter results. */
  toolbarFilters?: IToolbarFilter[];

  /** Extra querystring params passed to the backed API.  */
  queryParams?: QueryParams;
  defaultFilters?: { [key: string]: string[] };
}): IAutomationDashboardBaseView<T> {
  const { url, toolbarFilters, queryParams, defaultFilters } = options;

  const view = useView({
    defaultValues: {
      sort: 'template_name',
      sortDirection: 'asc',
      filterState: defaultFilters,
    },
    disableQueryString: false,
    ignoreQueryStringKeys: [],
  });
  const itemCountRef = useRef<{ itemCount: number | undefined }>({ itemCount: undefined });

  // Check if all required filters are valid
  const filtersValid = useMemo(() => {
    if (!toolbarFilters) return true;
    return hasValidRequiredFilters(toolbarFilters, view.filterState);
  }, [toolbarFilters, view.filterState]);

  const queryString = getQueryString(view, toolbarFilters || [], queryParams || {});

  // Only add queryString if all required filters are valid
  // If not valid, set url to null to prevent SWR from fetching
  const fetchUrl = filtersValid ? url + queryString : null;

  const fetcher = useFetcher();
  const response = useSWR<AwxItemsResponse<T>>(fetchUrl, fetcher, { keepPreviousData: true });
  const { data, mutate } = response;
  const refresh = useCallback(async () => {
    await mutate().finally(() => {});
  }, [mutate]);

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  let error: Error | undefined = response.error;
  if (error instanceof RequestError) {
    if ((error.statusCode === 404 || error.statusCode === 400) && view.page > 1) {
      view.setPage(1);
      error = undefined;
    }
  }

  if (data?.count !== undefined) {
    itemCountRef.current.itemCount = data?.count;
  }

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

  return useMemo<IAutomationDashboardBaseView<T>>(() => {
    return {
      ...view,
      refresh,
      itemCount: itemCountRef.current.itemCount,
      pageItems: items,
      limitFiltersToOneOrOperation: true,
      updateItem,
      error,
    };
  }, [error, items, refresh, updateItem, view]);
}
