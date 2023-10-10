import { createRequestError } from '../../common/crud/RequestError';
import { getCookie } from '../../common/crud/cookie';
import { TaskResponse } from '../tasks/Task';
import { parseTaskResponse } from './utils';

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
/**
 * Certain HTTP actions from the Pulp API returns a 202, requiring us to parse the task system to verify the task status.
 * This function returns the status code and the response from the API. If the
 * status code is 202, the response will be the task response.
 * This function is the base the build block of other request functions.
 * @param {string} url - url to send request to
 * @param {Options} options - options to send with request
 */
async function hubRequestCommon<T extends object | TaskResponse>(
  url: string,
  options: Options
): Promise<Response<T | TaskResponse>> {
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
    throw await createRequestError(receivedResponse);
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

export async function hubPostRequestFile(
  url: string,
  file: Blob,
  repository?: string,
  signed_collection?: string,
  signal?: AbortSignal
): Promise<unknown> {
  const body = new FormData();
  body.append('file', file);
  if (repository) {
    body.append('repository', repository);
  }
  if (signed_collection) {
    body.append('signed_collection', signed_collection);
  }

  const response = await fetch(url, {
    method: 'POST',
    body,
    signal,
    credentials: 'include',
    headers: {
      'X-CSRFToken': getCookie('csrftoken') ?? '',
    },
  });

  if (response.status === 202) {
    return parseTaskResponse((await response.json()) as TaskResponse);
  }

  if (!response.ok) {
    throw await createRequestError(response);
  }
}

export async function postHubRequest<
  ResponseBody extends object | TaskResponse,
  RequestBody = unknown,
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
  return hubRequestCommon<ResponseBody>(url, options);
}

export async function putHubRequest<
  ResponseBody extends object | TaskResponse,
  RequestBody = unknown,
>(
  url: string,
  data: RequestBody,
  signal?: AbortSignal
): Promise<Response<ResponseBody | TaskResponse>> {
  const options: Options = {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
    signal,
  };
  return hubRequestCommon<ResponseBody>(url, options);
}

export async function patchHubRequest<
  ResponseBody extends object | TaskResponse,
  RequestBody = unknown,
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
  return hubRequestCommon<ResponseBody>(url, options);
}

export async function deleteHubRequest<ResponseBody extends object | TaskResponse>(
  url: string,
  signal?: AbortSignal
): Promise<Response<ResponseBody | TaskResponse>> {
  const options: Options = {
    method: 'DELETE',
    signal,
  };
  return hubRequestCommon<ResponseBody>(url, options);
}

export async function getHubRequest<ResponseBody extends object | TaskResponse>(
  url: string,
  signal?: AbortSignal
): Promise<Response<ResponseBody | TaskResponse>> {
  const options: Options = {
    method: 'GET',
    signal,
  };
  return hubRequestCommon<ResponseBody>(url, options);
}
