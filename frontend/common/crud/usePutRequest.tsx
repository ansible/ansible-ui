import { useClearCache } from '../useInvalidateCache';
import { createRequestError } from './RequestError';
import { requestCommon } from './requestCommon';

/**
 * Hook for making PUT API requests
 *
 * - Returns a function that takes a url and body and returns the response body
 * - Throws an RequestError if the response is not ok
 * - Supports aborting the request on unmount
 */
export function usePutRequest<RequestBody, ResponseBody>() {
  const { clearCacheByKey } = useClearCache();
  return async (url: string, body: RequestBody, signal?: AbortSignal) => {
    const response: Response = await requestCommon({
      url,
      method: 'PUT',
      body,
      signal,
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
