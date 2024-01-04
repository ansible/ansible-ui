import useSWR from 'swr';
import { useCallback } from 'react';

export function useGetFn<T>(key: string, fetcher: () => Promise<T>) {
  const response = useSWR<T>(key, fetcher, { dedupingInterval: 0 });
  const refresh = useCallback(() => void response.mutate(), [response]);

  let error = response.error as Error;
  if (error && !(error instanceof Error)) {
    error = new Error('Unknown error');
  }

  return {
    data: response.data,
    error: response.isLoading ? undefined : error,
    refresh,
    isLoading: response.isLoading,
  };
}
