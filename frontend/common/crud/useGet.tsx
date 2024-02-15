import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useSWR, { SWRConfiguration } from 'swr';
import { createRequestError } from './RequestError';
import { normalizeQueryString } from './normalizeQueryString';
import { requestCommon } from './requestCommon';
import { useAbortController } from './useAbortController';

export function useGet<T>(
  url: string | undefined,
  query?: Record<string, string | number | boolean>,
  swrConfiguration: SWRConfiguration = {}
) {
  const getRequest = useGetRequest<T>();
  const [lastValue, setLastValue] = useState<T | undefined>();
  const getRequestWithoutAbortError = useCallback(
    async (url: string) => {
      try {
        return await getRequest(url).then((value) => {
          setLastValue(value);
          return value;
        });
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          // We need to return the last value if the request was aborted
          // This is because SWR internal workings
          return lastValue as T;
        }
        throw error;
      }
    },
    [getRequest, lastValue]
  );

  url += normalizeQueryString(query);
  const response = useSWR<T>(url, getRequestWithoutAbortError, {
    dedupingInterval: 0,
    ...swrConfiguration,
  });
  const refresh = useCallback(() => void response.mutate(), [response]);
  let error = response.error as Error;
  if (error && !(error instanceof Error)) {
    error = new Error('Unknown error');
  }

  return useMemo(
    () => ({
      data: response.data,
      error: response.isLoading ? undefined : error,
      refresh,
      isLoading: response.isLoading,
    }),
    [response.data, response.isLoading, error, refresh]
  );
}

/** Helper function */
export function useGetItem<T = unknown>(url: string, id?: string | number) {
  if (url.endsWith('/')) url = url.slice(0, url.length - 1);
  return useGet<T>(id ? `${url}/${id}/` : undefined);
}

export function useGetRequest<ResponseBody>() {
  const navigate = useNavigate();
  const abortController = useAbortController();
  return async (
    url: string,
    query?: Record<string, string | number | boolean>,
    signal?: AbortSignal
  ) => {
    const response = await requestCommon({
      url: url + normalizeQueryString(query),
      method: 'GET',
      signal: signal ?? abortController.signal,
    });
    if (!response.ok) {
      if (response.status === 401) {
        navigate('/login?navigate-back=true');
      }
      throw await createRequestError(response);
    }
    return (await response.json()) as ResponseBody;
  };
}
