import useSWRInfinite from 'swr/infinite';
import { useCallback, useMemo } from 'react';
import { ItemsResponse } from './Data';
import { useGetRequest } from './useGetRequest';

export function useGetAllPagesAWX<T extends object>(url: string) {
  const getRequest = useGetRequest<ItemsResponse<T>>();
  const getKey = useCallback(
    (pageIndex: number, previousPageData: ItemsResponse<T>) => {
      if (previousPageData && !previousPageData.next) return null;

      return `${url}?page=${pageIndex + 1}&page_size=200`;
    },
    [url]
  );

  const { data, error, isLoading, mutate } = useSWRInfinite<ItemsResponse<T>, Error>(
    getKey,
    getRequest,
    {
      initialSize: 200,
    }
  );

  const items = useMemo(() => {
    return data?.reduce((items: T[], page: ItemsResponse<T>) => {
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
