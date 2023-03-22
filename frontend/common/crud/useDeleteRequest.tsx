import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { RouteObj } from '../../Routes';
import { getCookie } from './cookie';
import { HTTPError } from './http-error';

export function useDeleteRequest() {
  const navigate = useNavigate();

  const abortController = useRef(new AbortController());
  useEffect(() => () => abortController.current.abort(), []);

  return async (url: string) => {
    const response = await fetch(url, {
      method: 'DELETE',
      credentials: 'include',
      headers: { 'X-CSRFToken': getCookie('csrftoken') ?? '' },
      signal: abortController.current.signal,
    });

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

    return response.json();
  };
}
