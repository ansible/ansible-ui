import { getCookie } from './cookie';

export function requestCommon(options: {
  url: string;
  method: string;
  body?: unknown;
  headers?: HeadersInit;
  signal?: AbortSignal;
}) {
  const { url, method, body, signal } = options;

  const headers: HeadersInit = {
    Accepts: 'application/json',
    'X-CSRFToken': getCookie('csrftoken') ?? '',
  };
  if (body) {
    headers['Content-Type'] = 'application/json';
  }

  return fetch(url, {
    method,
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'include',
    headers: { ...headers, ...options.headers },
    signal,
    redirect: 'error',
  });
}
