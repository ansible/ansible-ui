import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { RouteObj } from '../../Routes';
import { getCookie } from './cookie';
import { Delay } from './delay';
import { HTTPError } from './http-error';

export function usePostRequest<RequestBody = object, ResponseBody = RequestBody>() {
  const navigate = useNavigate();

  const abortSignalRef = useRef<{ signal?: AbortSignal }>({});
  useEffect(() => {
    const abortController = new AbortController();
    abortSignalRef.current.signal = abortController.signal;
    return () => abortController.abort();
  }, []);

  return async (url: string, body: RequestBody, signal?: AbortSignal) => {
    await Delay();

    const response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify(body),
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        Accepts: 'application/json',
        'X-CSRFToken': getCookie('csrftoken') ?? '',
      },
      signal: signal ?? abortSignalRef.current.signal,
    });

    if (!response.ok) {
      if (response.status === 401) {
        navigate(RouteObj.Login + '?navigate-back=true');
      }

      let responseBody: string | undefined;
      try {
        responseBody = await response.text();
      } catch {
        // Do nothing - response body was not valid json
      }

      throw new HTTPError(response.statusText, response.status, responseBody);
    }

    switch (response.status) {
      case 204: // No Content
        return null as ResponseBody;
    }
    return (await response.json()) as ResponseBody;
  };
}

export function postRequest<RequestBody = object>(
  url: string,
  body: RequestBody,
  signal?: AbortSignal
) {
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
