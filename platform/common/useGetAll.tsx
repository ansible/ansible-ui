import { useGetRequest } from '@ansible/common-ui/crud/useGet';
import { useCallback, useMemo } from 'react';
import useSWRInfinite from 'swr/infinite';

export interface IGetItemResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export function useGetAll<T extends object>(
  url: string | undefined,
  page_size = 100,
  order_by: string | null = 'name'
) {
  const getRequest = useGetRequest<IGetItemResponse<T>>();
  const getKey = useCallback(
    (pageIndex: number, previousPageData: IGetItemResponse<T>) => {
      if (!url) return null;
      if (previousPageData && !previousPageData.next) return null;
      const separator = url.includes('?') ? '&' : '?';
      const orderBy = order_by ? `order_by=${order_by}&` : '';
      return `${url}${separator}${orderBy}page=${pageIndex + 1}&page_size=${page_size}`;
    },
    [order_by, page_size, url]
  );

  const { data, error, isLoading, mutate } = useSWRInfinite<IGetItemResponse<T>, Error>(
    url ? getKey : () => null,
    getRequest,
    { initialSize: url ? page_size : 0 }
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
