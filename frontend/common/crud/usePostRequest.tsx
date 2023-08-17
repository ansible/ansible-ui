import { useNavigate } from 'react-router-dom';
import { RouteObj } from '../../Routes';
import { createRequestError } from './RequestError';
import { requestCommon } from './requestCommon';
import { useAbortController } from './useAbortController';

/**
 * Hook for making POST API requests
 *
 * - Returns a function that takes a url and body and returns the response body
 * - Throws an RequestError if the response is not ok
 * - Navigates to the login page if the response is a 401
 * - Supports aborting the request on unmount
 */
export function usePostRequest<RequestBody, ResponseBody = RequestBody>() {
  const navigate = useNavigate();
  const abortController = useAbortController();
  return async (url: string, body: RequestBody, signal?: AbortSignal) => {
    const response = await requestCommon({
      url,
      method: 'POST',
      body,
      signal: signal ?? abortController.signal,
    });
    if (!response.ok) {
      if (response.status === 401) {
        navigate(RouteObj.Login + '?navigate-back=true');
      }
      throw await createRequestError(response);
    }
    return (await response.json()) as ResponseBody;
  };
}
