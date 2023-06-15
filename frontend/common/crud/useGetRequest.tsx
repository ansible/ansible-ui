import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { RouteObj } from '../../Routes';
import { AnsibleError } from './ansible-error';

export function useGetRequest<ResponseBody>() {
  const navigate = useNavigate();

  const abortSignalRef = useRef<{ signal?: AbortSignal }>({});
  useEffect(() => {
    const abortController = new AbortController();
    abortSignalRef.current.signal = abortController.signal;
    return () => abortController.abort();
  }, []);

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
      signal: abortSignalRef.current.signal,
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

      throw new AnsibleError(response.statusText, response.status, responseBody);
    }

    return (await response.json()) as ResponseBody;
  };
}
