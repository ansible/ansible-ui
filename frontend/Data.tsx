/* eslint-disable no-console */
import ky, { HTTPError, ResponsePromise } from 'ky';
import { Input, Options } from 'ky/distribution/types/options';
import { SWRConfiguration } from 'swr';
import { RouteE } from './Routes';

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
