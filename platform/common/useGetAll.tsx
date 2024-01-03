import { useCallback, useMemo } from 'react';
import useSWRInfinite from 'swr/infinite';
import { useGetRequest } from '../../frontend/common/crud/useGet';

export interface IGetItemResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export function useGetAll<T extends object>(url: string, page_size = 100) {
  const getRequest = useGetRequest<IGetItemResponse<T>>();
  const getKey = useCallback(
    (pageIndex: number, previousPageData: IGetItemResponse<T>) => {
      if (previousPageData && !previousPageData.next) return null;
      return `${url}?order_by=name&page=${pageIndex + 1}&page_size=${page_size}`;
    },
    [page_size, url]
  );

  const { data, error, isLoading, mutate } = useSWRInfinite<IGetItemResponse<T>, Error>(
    getKey,
    getRequest,
    { initialSize: page_size }
  );

  const items = useMemo(() => {
    return data?.reduce((items: T[], page: IGetItemResponse<T>) => {
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
