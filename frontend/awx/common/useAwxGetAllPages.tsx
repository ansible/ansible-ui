import { useCallback, useMemo } from 'react';
import useSWRInfinite from 'swr/infinite';
import { useGetRequest } from '../../common/crud/useGet';
import { normalizeQueryString } from '../../common/crud/normalizeQueryString';
import { QueryParams } from '../useAwxView';
import { AwxItemsResponse } from './AwxItemsResponse';

export function useAwxGetAllPages<T extends object>(url: string, queryParams?: QueryParams) {
  const getRequest = useGetRequest<AwxItemsResponse<T>>();
  const getKey = useCallback(
    (pageIndex: number, previousPageData: AwxItemsResponse<T>) => {
      if (previousPageData && !previousPageData.next) return null;
      return `${url}${normalizeQueryString({
        ...queryParams,
        page: pageIndex + 1,
        page_size: 200,
      })}`;
    },
    [url, queryParams]
  );

  const { data, error, isLoading, mutate } = useSWRInfinite<AwxItemsResponse<T>, Error>(
    getKey,
    getRequest,
    {
      initialSize: 200,
    }
  );

  const items = useMemo(() => {
    return data?.reduce((items: T[], page: AwxItemsResponse<T>) => {
      if (Array.isArray(page.results)) {
        return [...items, ...page.results];
      }
      return items;
    }, []);
  }, [data]);

  const refresh = useCallback(() => {
    void mutate();
  }, [mutate]);
  return { items, error, isLoading, refresh };
}
