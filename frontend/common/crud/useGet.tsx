import { useCallback, useEffect, useMemo, useRef } from 'react';
import useSWR from 'swr';
import { useGetRequest } from './useGetRequest';

/**
 * @deprecated Use useGet instead
 */
export function useItem<T = unknown>(url: string, id: string | number) {
  const response = useGet<T>(`${url}/${id}/`);
  return response.data;
}

/** UseGet- returns data from a url. */
export function useGet<T>(url: string, query?: Record<string, string | number | boolean>) {
  const getRequest = useGetRequest<T>();

  const abortController = useRef(new AbortController());
  useEffect(() => () => abortController.current.abort(), []);

  if (query && Object.keys(query).length > 0) {
    const normalizedQuery = Object.keys(query).reduce<Record<string, string>>(
      (normalizedQuery, key) => {
        normalizedQuery[key] = query[key].toString();
        return normalizedQuery;
      },
      {}
    );
    url += '?' + new URLSearchParams(normalizedQuery).toString();
  }

  const response = useSWR<T>(url, getRequest);

  const refresh = useCallback(() => {
    void response.mutate();
  }, [response]);

  let error = response.error as Error | undefined;
  if (!(error instanceof Error)) error = new Error('Unknown error');

  return useMemo(
    () => ({
      isLoading: response.isLoading,
      data: response.data,
      error: error,
      refresh,
    }),
    [response.isLoading, response.data, error, refresh]
  );
}
