import { useCallback } from 'react';
import useSWR, { SWRConfiguration } from 'swr';
import { useAbortController } from '../../../common/crud/useAbortController';

export function useGetFn<T>(
  key: string,
  fetcher: (signal?: AbortSignal) => Promise<T>,
  swrConfiguration: SWRConfiguration = {}
) {
  const abortController = useAbortController();
  // const navigate = useNavigate();
  const response = useSWR<T>(
    key,
    (_id, signal?: AbortSignal) =>
      fetcher(signal ?? abortController.signal).catch((error) => {
        // if (error instanceof RequestError && error.statusCode === 401) {
        //   navigate('/login?navigate-back=true');
        // }

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
