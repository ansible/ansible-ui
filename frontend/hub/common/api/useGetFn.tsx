import { useCallback } from 'react';
import useSWR, { SWRConfiguration } from 'swr';
<<<<<<< HEAD
import { useAbortController } from '../../../../framework/hooks/useAbortController';
=======
import { useAbortController } from '../../../common/crud/useAbortController';
>>>>>>> 8269c803c (Login Flow Update (#1946))

export function useGetFn<T>(
  key: string,
  fetcher: (signal?: AbortSignal) => Promise<T>,
  swrConfiguration: SWRConfiguration = {}
) {
  const abortController = useAbortController();
  const response = useSWR<T>(
    key,
    (_id, signal?: AbortSignal) =>
      fetcher(signal ?? abortController.signal).catch((error) => {
        throw error;
      }),
    { dedupingInterval: 0, ...swrConfiguration }
  );
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
