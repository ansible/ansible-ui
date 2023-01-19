/* eslint-disable no-console */
import { AlertProps } from '@patternfly/react-core';
import ky, { HTTPError, ResponsePromise } from 'ky';
import { Input, Options } from 'ky/distribution/types/options';
import { useEffect, useMemo } from 'react';
import { NavigateFunction, useNavigate } from 'react-router-dom';
import useSWR, { SWRConfiguration, SWRResponse } from 'swr';
import { usePageAlerts } from '../framework/PageAlerts';
import { RouteE } from './Routes';

export function useHandleSWRResponseError(swrResponse: SWRResponse, errorTitle?: string) {
  const alertToaster = usePageAlerts();
  const alert = useMemo<AlertProps>(() => ({ title: '', variant: 'danger' }), []);
  useEffect(() => {
    if (swrResponse.error) {
      if (errorTitle) {
        alert.title = errorTitle;
        if (swrResponse.error instanceof Error) {
          alert.children = swrResponse.error.message;
        } else {
          alert.children = undefined;
        }
      } else {
        if (swrResponse.error instanceof Error) {
          alert.title = swrResponse.error.message;
        } else {
          alert.title = 'Unknown error';
        }
        alert.children = undefined;
      }
      alertToaster.addAlert(alert);
    } else {
      alertToaster.removeAlert(alert);
    }
  }, [alert, alertToaster, errorTitle, swrResponse.error]);
}

function handleSwrResponseError(swrResponse: SWRResponse, navigate: NavigateFunction) {
  const error = swrResponse.error as unknown;
  if (error) {
    if (error instanceof HTTPError) {
      if (error.response.status === 401) {
        navigate(RouteE.Login + '?navigate-back=true');
      }

      // error.message = 'SOMETHING ELSE...';
    }
  }
}

export function useOptions<T>(options: { url: string; errorTitle?: string }) {
  const navigate = useNavigate();
  const { url } = options;
  const abortController = useMemo(() => new AbortController(), []);
  useEffect(() => () => abortController.abort(), [abortController]);
  const fetcher = useOptionsFetcher(abortController?.signal);
  const swrResponse = useSWR<T>(url, fetcher);
  handleSwrResponseError(swrResponse, navigate);
  return swrResponse;
}

function useOptionsFetcher(signal?: AbortSignal) {
  return (url: string) =>
    fetch(url, { method: 'OPTIONS', credentials: 'include', signal }).then((response) =>
      response.json()
    );
}

export function useGet2<T>(options: {
  url: string;
  query?: Record<string, string | number | boolean>;
  errorTitle?: string;
}) {
  const navigate = useNavigate();
  let { url } = options;
  const { query, errorTitle } = options;
  const abortController = useMemo(() => new AbortController(), []);
  useEffect(() => () => abortController.abort(), [abortController]);
  const fetcher = useGetFetcher(abortController?.signal);
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
  const swrResponse = useSWR<T>(url, fetcher);
  handleSwrResponseError(swrResponse, navigate);
  useHandleSWRResponseError(swrResponse, errorTitle);
  return swrResponse;
}

function useGetFetcher(signal?: AbortSignal) {
  return (url: string) =>
    fetch(url, { method: 'GET', credentials: 'include', signal }).then((response) =>
      response.json()
    );
}

export async function requestHead<ResponseBody>(url: string): Promise<ResponseBody> {
  return requestCommon<ResponseBody>(url, {}, ky.head);
}

export async function requestOptions<ResponseBody>(url: string): Promise<ResponseBody> {
  return requestCommon<ResponseBody>(url, { method: 'OPTIONS' }, ky.get);
}

export async function requestGet<ResponseBody>(
  url: string,
  signal?: AbortSignal
): Promise<ResponseBody> {
  return requestCommon<ResponseBody>(url, { signal }, ky.get);
}

export async function requestPut<ResponseBody, RequestBody = unknown>(
  url: string,
  json: RequestBody
): Promise<ResponseBody> {
  return requestCommon<ResponseBody>(url, { json }, ky.put);
}

export async function requestPost<ResponseBody, RequestBody = unknown>(
  url: string,
  json: RequestBody,
  signal?: AbortSignal
): Promise<ResponseBody> {
  return requestCommon<ResponseBody>(url, { json, signal }, ky.post);
}

export async function requestPostFile(
  url: string,
  file: Blob,
  signal?: AbortSignal
): Promise<string> {
  const body = new FormData();
  body.append('file', file);
  return ky.post(url, { body, signal, credentials: 'include' }).json();
}

export async function requestPatch<ResponseBody, RequestBody = unknown>(
  url: string,
  json: RequestBody
): Promise<ResponseBody> {
  return requestCommon<ResponseBody>(url, { json }, ky.patch);
}

export async function requestDelete<ResponseBody>(
  url: string,
  signal?: AbortSignal
): Promise<ResponseBody> {
  return requestCommon<ResponseBody>(url, { signal }, ky.delete);
}

async function requestCommon<ResponseBody>(
  url: string,
  options: Options,
  methodFn: (input: Input, options: Options) => ResponsePromise
) {
  if (process.env.DELAY)
    await new Promise((resolve) => setTimeout(resolve, Number(process.env.DELAY)));
  try {
    const result = await methodFn(url, {
      ...options,
      credentials: 'include',
      headers: options.headers,
      hooks: {
        beforeError: [
          async (error) => {
            const { response } = error;
            const body: unknown = await response?.json();
            if (
              typeof body === 'object' &&
              body !== null &&
              'msg' in body &&
              typeof body.msg === 'string'
            ) {
              error.name = 'Controller Error';
              error.message = body.msg;
            }
            return error;
          },
        ],
      },
    }).json<ResponseBody>();
    return result;
  } catch (err) {
    if (err instanceof HTTPError) {
      switch (err.response.status) {
        case 401:
          location.assign(RouteE.Login + '?navigate-back=true');
          break;
      }
    }
    throw err;
  }
}

export function useFetcher() {
  return requestGet;
}

export interface ItemsResponse<T> {
  count: number;
  next?: string | null;
  previous?: string | null;
  results: T[];
}

export function getItemKey(item: { id: number }) {
  return item.id.toString();
}

export const swrOptions: SWRConfiguration = {
  dedupingInterval: 0,
};

export function setCookie(cookie: string, value: string) {
  const date = new Date();
  date.setTime(date.getTime() + 30 * 24 * 60 * 60 * 1000);
  const expires = 'expires=' + date.toUTCString();
  document.cookie = cookie + '=' + value + ';' + expires + ';path=/';
}
