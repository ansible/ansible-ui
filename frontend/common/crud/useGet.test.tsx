import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { SwrTestWrapper } from '../../../framework/test-utils/swrTestWrapper';
import { useGet, useGetItem, useGetRequest } from './useGet';

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('useGet', () => {
  it('should fetch data with query string', async () => {
    server.use(http.get('/api/items/', () => HttpResponse.json({ count: 1, results: [] })));

    const { result } = renderHook(() => useGet('/api/items/', { page: 1 }), {
      wrapper: SwrTestWrapper,
    });

    await waitFor(() => expect(result.current.data).toBeDefined());
    expect(result.current.error).toBeUndefined();
    expect(result.current.isLoading).toBe(false);
  });

  it('should not fetch when url is undefined', () => {
    const { result } = renderHook(() => useGet(undefined), { wrapper: SwrTestWrapper });
    expect(result.current.data).toBeUndefined();
    expect(result.current.isLoading).toBe(false);
  });

  it('should expose error on failed request', async () => {
    server.use(
      http.get('/api/fail/', () => HttpResponse.json({ detail: 'fail' }, { status: 500 }))
    );

    const { result } = renderHook(() => useGet('/api/fail/'), { wrapper: SwrTestWrapper });

    await waitFor(() => expect(result.current.error).toBeDefined());
  });
});

describe('useGetItem', () => {
  it('should fetch item by id', async () => {
    server.use(http.get('/api/items/5/', () => HttpResponse.json({ id: 5, name: 'Item' })));

    const { result } = renderHook(() => useGetItem('/api/items/', 5), { wrapper: SwrTestWrapper });

    await waitFor(() => expect(result.current.data).toEqual({ id: 5, name: 'Item' }));
  });
});

describe('useGetRequest', () => {
  it('should fetch json via returned function', async () => {
    server.use(http.get('/api/ping/', () => HttpResponse.json({ ok: true })));

    const { result } = renderHook(() => useGetRequest<{ ok: boolean }>(), {
      wrapper: SwrTestWrapper,
    });

    await expect(result.current('/api/ping/')).resolves.toEqual({ ok: true });
  });
});
