import { AnsibleError } from '../../common/crud/ansible-error';
import { getCookie } from '../../common/crud/cookie';
import { Delay } from '../../common/crud/delay';
import { TaskResponse } from '../tasks/Task';

interface Options {
  method: string;
  headers?: HeadersInit;
  body?: BodyInit;
  signal?: AbortSignal;
}

interface Response<T> {
  statusCode: number;
  response: T;
}

export async function request<T extends object | TaskResponse>(
  url: string,
  options: Options
): Promise<Response<T | TaskResponse>> {
  await Delay();

  const defaultHeaders = {
    'X-CSRFToken': getCookie('csrftoken') || '',
  };
  const receivedResponse = await fetch(url, {
    credentials: 'include',
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });

  if (!receivedResponse.ok) {
    throw new AnsibleError(
      receivedResponse.statusText,
      receivedResponse.status,
      await receivedResponse.text()
    );
  }

  const statusCode = receivedResponse.status;
  if (statusCode === 202) {
    const taskResponse = (await receivedResponse.json()) as TaskResponse;
    return {
      statusCode,
      response: taskResponse,
    };
  }

  const genericResponse = (await receivedResponse.json()) as T;
  return {
    statusCode,
    response: genericResponse,
  };
}

export async function postRequest<
  ResponseBody extends object | TaskResponse,
  RequestBody = unknown
>(
  url: string,
  data: RequestBody,
  signal?: AbortSignal
): Promise<Response<ResponseBody | TaskResponse>> {
  const options: Options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
    signal,
  };
  return request<ResponseBody>(url, options);
}

export async function patchRequest<
  ResponseBody extends object | TaskResponse,
  RequestBody = unknown
>(
  url: string,
  data: RequestBody,
  signal?: AbortSignal
): Promise<Response<ResponseBody | TaskResponse>> {
  const options: Options = {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
    signal,
  };
  return request<ResponseBody>(url, options);
}

export async function deleteRequest<ResponseBody extends object | TaskResponse>(
  url: string,
  signal?: AbortSignal
): Promise<Response<ResponseBody | TaskResponse>> {
  const options: Options = {
    method: 'DELETE',
    signal,
  };
  return request<ResponseBody>(url, options);
}

export async function getRequest<ResponseBody extends object | TaskResponse>(
  url: string,
  signal?: AbortSignal
): Promise<Response<ResponseBody | TaskResponse>> {
  const options: Options = {
    method: 'GET',
    signal,
  };
  return request<ResponseBody>(url, options);
}
