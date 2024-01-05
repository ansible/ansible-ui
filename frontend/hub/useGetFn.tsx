import useSWR from 'swr';
import { useCallback } from 'react';
import { requestCommon } from '../common/crud/requestCommon';
import { createRequestError } from '../common/crud/RequestError';

export function get(url) {
  return requestCommon({
    url,
    method: 'GET',
  }).then(async (response) => {
    if (!response.ok) {
      throw await createRequestError(response);
    }

    return response.json();
  });
}

export function useGetFn<T>(loader, params) {
  const response = useSWR<T>(params, loader, { dedupingInterval: 0 });
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
