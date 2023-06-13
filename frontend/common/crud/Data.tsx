/* eslint-disable no-console */
import ky, { HTTPError, ResponsePromise } from 'ky';
import { Input, Options } from 'ky/distribution/types/options';
import { SWRConfiguration } from 'swr';
import { RouteObj } from '../../Routes';
import { getCookie } from './cookie';

export async function requestGet<ResponseBody>(
  url: string,
  signal?: AbortSignal
): Promise<ResponseBody> {
  return requestCommon<ResponseBody>(url, { signal }, ky.get);
}

export async function postRequest<ResponseBody, RequestBody = unknown>(
  url: string,
  json: RequestBody,
  signal?: AbortSignal
): Promise<ResponseBody> {
  return requestCommon<ResponseBody>(url, { json, signal }, ky.post);
}

export async function postRequestFile(
  url: string,
  file: Blob,
  signal?: AbortSignal
): Promise<string> {
  const body = new FormData();
  body.append('file', file);
  return ky
    .post(url, {
      body,
      signal,
      credentials: 'include',
      headers: {
        'X-CSRFToken': getCookie('csrftoken') ?? '',
      },
    })
    .json();
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
  try {
    const result = await methodFn(url, {
      ...options,
      credentials: 'include',
      headers: {
        ...options.headers,
        'X-CSRFToken': getCookie('csrftoken'),
      },

      hooks: {
        beforeError: [
          async (error) => {
            const { response } = error;

            let body: unknown;
            try {
              body = await response?.clone().json();
            } catch (bodyParseError) {
              return error;
            }

            if (
              typeof body === 'object' &&
              body !== null &&
              'msg' in body &&
              typeof body.msg === 'string'
            ) {
              error.name = 'Error';
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
          location.assign(RouteObj.Login + '?navigate-back=true');
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

export function getItemKey(item: { id: number | string }) {
  return item.id.toString();
}

export const swrOptions: SWRConfiguration = {
  dedupingInterval: 0,
};
