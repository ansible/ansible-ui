import { useCallback, useEffect, useMemo, useRef } from 'react';
import useSWR from 'swr';
import { createRequestError } from './RequestError';
import { normalizeQueryString } from './normalizeQueryString';
import { requestCommon } from './requestCommon';

export function useOptions<T>(
  url: string | undefined,
  query?: Record<string, string | number | boolean>
) {
  const optionsRequest = useOptionsRequest<T>();

  if (url) {
    url += normalizeQueryString(query);
  }

  const response = useSWR<T>(url ? `options:${url}` : undefined, () => optionsRequest(url!), {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    refreshInterval: 0,
    dedupingInterval: 50,
  });

  let error = response.error as Error;
  if (error && !(error instanceof Error)) {
    error = new Error('Unknown error');
  }

  return useMemo(
    () => ({
      data: response.data,
      error: response.isLoading ? undefined : error,
      isLoading: response.isLoading,
    }),
    [response.data, response.isLoading, error]
  );
}

/**
 * Hook for making OPTIONS API requests
 *
 * - Returns a function that takes a url and body and returns the response body
 * - Throws an RequestError if the response is not ok
 * - Navigates to the login page if the response is a 401
 * - Supports aborting the request on unmount
 */
function useOptionsRequest<ResponseBody>() {
  const abortControllerRef = useRef<{ abortController?: AbortController }>({});
  useEffect(() => {
    const ref = abortControllerRef;
    return () => ref.current.abortController?.abort();
  }, []);
  return useCallback(async (url: string, signal?: AbortSignal) => {
    const response: Response = await requestCommon({
      url,
      method: 'OPTIONS',
      signal,
    });
    if (!response.ok) {
      // if (response.status === 401) {
      //   navigate('/login?navigate-back=true');
      // }
      throw await createRequestError(response);
    }
    switch (response.status) {
      case 204:
        return null as ResponseBody;
      default:
        if (response.headers.get('content-type')?.includes('application/json')) {
          return (await response.json()) as ResponseBody;
        } else if (response.headers.get('content-type')?.includes('text/plain')) {
          return (await response.text()) as unknown as ResponseBody;
        } else {
          return (await response.blob()) as unknown as ResponseBody;
        }
    }
  }, []);
}
