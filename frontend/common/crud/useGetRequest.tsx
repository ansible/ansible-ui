import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { RouteObj } from '../../Routes';
import { HTTPError } from './http-error';

export function useGetRequest<ResponseBody>() {
  const navigate = useNavigate();

  const abortController = useRef(new AbortController());
  useEffect(() => () => abortController.current.abort(), []);

  return async (url: string, query?: Record<string, string | number | boolean>) => {
    if (query && Object.keys(query).length > 0) {
      const normalizedQuery = Object.keys(query).reduce<Record<string, string>>(
        (normalizedQuery, key) => {
          normalizedQuery[key] = query[key].toString();
          return normalizedQuery;
        },
        {}
      );
      url += '?' + new URLSearchParams(normalizedQuery).toString();
    }

    const response = await fetch(url, {
      credentials: 'include',
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

    return (await response.json()) as ResponseBody;
  };
}
