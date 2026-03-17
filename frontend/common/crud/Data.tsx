/* eslint-disable no-console */
import { SWRConfiguration } from 'swr';
import { createRequestError } from './RequestError';
import { requestCommon } from './requestCommon';

interface Options {
  method: 'GET' | 'PUT' | 'POST' | 'PATCH' | 'DELETE' | 'OPTIONS';
  headers?: HeadersInit;
  json?: unknown;
  signal?: AbortSignal;
}

export async function requestGet<ResponseBody>(
  url: string,
  signal?: AbortSignal
): Promise<ResponseBody> {
  const options: Options = { signal, method: 'GET' };
  return requestFactory<ResponseBody>(url, options);
}

export async function postRequest<ResponseBody, RequestBody = unknown>(
  url: string,
  json: RequestBody,
  signal?: AbortSignal
): Promise<ResponseBody> {
  const options: Options = {
    method: 'POST',
    json,
    signal,
  };
  return requestFactory<ResponseBody>(url, options);
}

export async function requestPut<ResponseBody, RequestBody = unknown>(
  url: string,
  json: RequestBody,
  signal?: AbortSignal
): Promise<ResponseBody> {
  const options: Options = {
    method: 'PUT',
    json,
    signal,
  };
  return requestFactory<ResponseBody>(url, options);
}

export async function requestPatch<ResponseBody, RequestBody = unknown>(
  url: string,
  json: RequestBody
): Promise<ResponseBody> {
  const options: Options = {
    method: 'PATCH',
    json,
  };
  return requestFactory<ResponseBody>(url, options);
}

export async function requestDelete<ResponseBody>(
  url: string,
  signal: AbortSignal
): Promise<ResponseBody> {
  const options: Options = { signal, method: 'DELETE' };
  return requestFactory<ResponseBody>(url, options);
}

async function requestFactory<ResponseBody>(url: string, options: Options) {
  const method = options.method;
  const body = options.json;
  const headers = options.headers;
  const signal = options.signal;

  const result = await requestCommon({
    url,
    method,
    body,
    headers,
    signal,
  });
  if (!result.ok) {
    throw await createRequestError(result);
  }
  // There is an AWX endpoint that returns 202 on DELETE, with no body. Workaround.
  if (method === 'DELETE') {
    if (result.status === 202 || result.status === 204) {
      return null as ResponseBody;
    }
  }

  // EDA logout returns 204 with no body. Workaround.
  if (method === 'POST') {
    if (result.status === 204) {
      return null as ResponseBody;
    }
  }
  return result.json() as Promise<ResponseBody>;
}

export function useFetcher() {
  return requestGet;
}

export function usePostFetcher() {
  return postRequest;
}

export function getItemKey(item: { id: number | string }) {
  return item?.id.toString();
}

export const swrOptions: SWRConfiguration = {
  dedupingInterval: 0,
};
