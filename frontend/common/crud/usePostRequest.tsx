import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { RouteObj } from '../../Routes';
import { getCookie } from './cookie';
import { HTTPError } from './http-error';

export function usePostRequest<RequestBody = object, ResponseBody = RequestBody>() {
  const navigate = useNavigate();

  const abortController = useRef(new AbortController());
  useEffect(() => () => abortController.current.abort(), []);

  return async (url: string, body: RequestBody, signal?: AbortSignal) => {
    const response = await postRequest(url, body, signal ?? abortController.current.signal);

    if (!response.ok) {
      if (response.status === 401) {
        navigate(RouteObj.Login + '?navigate-back=true');
      }

      let responseBody: object | undefined;
      try {
        responseBody = (await response.json()) as object;
      } catch {
        // Do nothing - response body was not valid json
      }

      throw new HTTPError(response.statusText, response.status, responseBody);
    }

    return (await response.json()) as ResponseBody;
  };
}

function postRequest<RequestBody = object>(url: string, body: RequestBody, signal?: AbortSignal) {
  return fetch(url, {
    method: 'POST',
    body: JSON.stringify(body),
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      Accepts: 'application/json',
      'X-CSRFToken': getCookie('csrftoken') ?? '',
    },
    signal: signal,
  });
}
