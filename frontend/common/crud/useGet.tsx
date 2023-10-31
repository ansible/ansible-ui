import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import useSWR, { SWRConfiguration } from 'swr';
import { RouteObj } from '../Routes';
import { createRequestError } from './RequestError';
import { normalizeQueryString } from './normalizeQueryString';
import { requestCommon } from './requestCommon';
import { useAbortController } from './useAbortController';

import { LoadingPage } from '../../../framework/components/LoadingPage';
import { AwxError } from '../../awx/common/AwxError';

export function useGet<T>(
  url: string | undefined,
  query?: Record<string, string | number | boolean>,
  swrConfiguration: SWRConfiguration = {}
) {
  const getRequest = useGetRequest<T>();

  url += normalizeQueryString(query);
  const response = useSWR<T>(url, getRequest, {
    dedupingInterval: 0,
    ...swrConfiguration,
  });
  const refresh = useCallback(() => void response.mutate(), [response]);
  let error = response.error as Error;
  if (error && !(error instanceof Error)) {
    error = new Error('Unknown error');
  }

  return useMemo(
    () => ({
      data: response.data,
      error: response.isLoading ? undefined : error,
      refresh,
      isLoading: response.isLoading,
      /**
       * Renders error or loading element, can be used to simplify loading and error logic in application.
       */
      renderErrorOrLoading: error ? (
        <AwxError error={error} handleRefresh={refresh} />
      ) : response.isLoading ? (
        <LoadingPage breadcrumbs tabs />
      ) : null,
    }),
    [response.data, response.isLoading, error, refresh]
  );
}

/** Helper function */
export function useGetItem<T = unknown>(url: string, id?: string | number) {
  if (url.endsWith('/')) url = url.slice(0, url.length - 1);
  return useGet<T>(id ? `${url}/${id}/` : undefined);
}

export function useGetRequest<ResponseBody>() {
  const navigate = useNavigate();
  const abortController = useAbortController();
  return async (
    url: string,
    query?: Record<string, string | number | boolean>,
    signal?: AbortSignal
  ) => {
    const response = await requestCommon({
      url: url + normalizeQueryString(query),
      method: 'GET',
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
