import { useCallback, useEffect, useMemo, useRef } from 'react';
import useSWR from 'swr';
import { useGetRequest } from './useGetRequest';

/** useGet - returns data from a url. */
export function useGet<T>(
  url: string | undefined,
  query?: Record<string, string | number | boolean>
) {
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

  const response = useSWR<T>(url, getRequest, { dedupingInterval: 0 });

  const refresh = useCallback(() => {
    void response.mutate();
  }, [response]);

  let error = response.error as Error | undefined;
  if (error && !(error instanceof Error)) {
    error = new Error('Unknown error');
  }

  return useMemo(
    () => ({
      data: response.data,
      error: response.isLoading ? undefined : error,
      refresh,
    }),
    [response.data, response.isLoading, error, refresh]
  );
}
