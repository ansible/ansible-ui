import { useCallback, useEffect, useMemo, useRef } from 'react';
import useSWR, { SWRConfiguration } from 'swr';
import { createRequestError } from './RequestError';
import { normalizeQueryString } from './normalizeQueryString';
import { requestCommon } from './requestCommon';

export function useGet<T>(
  url: string | undefined,
  query?: Record<string, string | number | boolean>,
  swrConfiguration: SWRConfiguration = {}
) {
  const getRequest = useGetRequest<T>();

  url += normalizeQueryString(query);
  const response = useSWR<T>(url, getRequest, {
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
export function useGetItem<T = unknown>(
  url: string,
  id?: string | number,
  swrOptions?: SWRConfiguration
) {
  if (url.endsWith('/')) url = url.slice(0, url.length - 1);
  return useGet<T>(id ? `${url}/${id}/` : undefined, undefined, swrOptions);
}

export function useGetRequest<ResponseBody>() {
  const abortControllerRef = useRef<{ abortController?: AbortController }>({});
  useEffect(() => {
    const ref = abortControllerRef;
    return () => ref.current.abortController?.abort();
  }, []);
  return async (
    url: string,
    query?: Record<string, string | number | boolean>,
    signal?: AbortSignal
  ) => {
    const response: Response = await requestCommon({
      url: url + normalizeQueryString(query),
      method: 'GET',
      signal,
    });
    if (!response.ok) {
      throw await createRequestError(response);
    }
    return (await response.json()) as ResponseBody;
  };
}
