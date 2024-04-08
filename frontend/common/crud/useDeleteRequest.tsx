import { useEffect, useRef } from 'react';
import { useClearCache } from '../useInvalidateCache';
import { createRequestError } from './RequestError';
import { requestCommon } from './requestCommon';

/**
 * Hook for making DELETE API requests
 *
 * - Returns a function that takes a url and body and returns the response body
 * - Throws an RequestError if the response is not ok
 * - Supports aborting the request on unmount
 */
export function useDeleteRequest<ResponseBody = unknown>() {
  const { clearCacheByKey } = useClearCache();
  const abortControllerRef = useRef<{ abortController?: AbortController }>({});
  useEffect(() => {
    const ref = abortControllerRef;
    return () => ref.current.abortController?.abort();
  }, []);
  return async (url: string, signal?: AbortSignal) => {
    const response: Response = await requestCommon({
      url,
      method: 'DELETE',
      signal: signal,
    });
    if (!response.ok) {
      throw await createRequestError(response);
    }
    clearCacheByKey(url);
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
