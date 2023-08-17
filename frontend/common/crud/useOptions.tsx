import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import useSWR, { SWRConfiguration } from 'swr';
import { RouteObj } from '../../Routes';
import { createRequestError } from './RequestError';
import { normalizeQueryString } from './normalizeQueryString';
import { requestCommon } from './requestCommon';
import { useAbortController } from './useAbortController';

export function useOptions<T>(
  url: string | undefined,
  query?: Record<string, string | number | boolean>,
  swrConfiguration: SWRConfiguration = {}
) {
  const getOptions = useOptionsRequest<T>();
  url += normalizeQueryString(query);
  const response = useSWR<T>(url, getOptions, {
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

/**
 * Hook for making OPTIONS API requests
 *
 * - Returns a function that takes a url and body and returns the response body
 * - Throws an RequestError if the response is not ok
 * - Navigates to the login page if the response is a 401
 * - Supports aborting the request on unmount
 */
function useOptionsRequest<ResponseBody>() {
  const navigate = useNavigate();
  const abortController = useAbortController();
  return async (url: string, signal?: AbortSignal) => {
    const response = await requestCommon({
      url,
      method: 'OPTIONS',
      signal: signal ?? abortController.signal,
    });
    if (!response.ok) {
      if (response.status === 401) {
        navigate(RouteObj.Login + '?navigate-back=true');
      }
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
  };
}
