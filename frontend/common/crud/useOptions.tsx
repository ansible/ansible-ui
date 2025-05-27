import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createRequestError } from './RequestError';
import { normalizeQueryString } from './normalizeQueryString';
import { requestCommon } from './requestCommon';

export function useOptions<T>(
  url: string | undefined,
  query?: Record<string, string | number | boolean>
) {
  const getOptions = useOptionsRequest<T>();
  url += normalizeQueryString(query);

  const [data, setData] = useState<T | undefined>(undefined);
  const [error, setError] = useState<Error | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  // Options is using a straight request instead of SWR
  // because otherwise SWR would cache the response and
  // and GETS would get the cached response instead of the correct one
  useEffect(() => {
    if (!url) return;
    void getOptions(url)
      .then((data) => setData(data))
      .catch((error) => setError(error instanceof Error ? error : new Error('Unknown error')))
      .finally(() => setIsLoading(false));
  }, [getOptions, url]);

  return useMemo(() => ({ data, error, isLoading }), [data, error, isLoading]);
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
