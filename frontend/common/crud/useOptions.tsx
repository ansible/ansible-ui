import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import useSWR from 'swr';
import { RouteObj } from '../../Routes';
import { HTTPError } from './http-error';

export function useOptions<T>(url: string) {
  const optionsRequest = useOptionsRequest<T>();

  const abortSignalRef = useRef<{ signal?: AbortSignal }>({});
  useEffect(() => {
    const abortController = new AbortController();
    abortSignalRef.current.signal = abortController.signal;
    return () => abortController.abort();
  }, []);

  const response = useSWR<T>(url, optionsRequest, {
    dedupingInterval: 0,
  });

  const refresh = useCallback(() => {
    void response.mutate();
  }, [response]);

  let error = response.error as Error | undefined;
  if (!(error instanceof Error)) error = new Error('Unknown error');

  return useMemo(
    () => ({
      isLoading: response.isLoading,
      data: response.data,
      error: error,
      refresh,
    }),
    [response.isLoading, response.data, error, refresh]
  );
}

function useOptionsRequest<ResponseBody = unknown>() {
  const navigate = useNavigate();

  const abortController = useRef(new AbortController());
  useEffect(() => () => abortController.current.abort(), []);

  return async (url: string) => {
    const response = await fetch(url, {
      method: 'OPTIONS',
      credentials: 'include',
      signal: abortController.current.signal,
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

    return (await response.json()) as ResponseBody;
  };
}
