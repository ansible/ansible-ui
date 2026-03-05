import { renderHook, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';
import { SWRConfig } from 'swr';
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { useGetFn } from './useGetFn';

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const wrapper = ({ children }: { children: ReactNode }) => (
  <SWRConfig
    value={{
      dedupingInterval: 0,
      provider: () => new Map(),
      shouldRetryOnError: false,
    }}
  >
    {children}
  </SWRConfig>
);

interface TestItem {
  id: number;
  name: string;
}

describe('useGetFn', () => {
  test('should fetch data using a custom fetcher', async () => {
    server.use(
      http.get('/api/test/', () => {
        return HttpResponse.json({ id: 1, name: 'item' });
      })
    );

    const fetcher = async () => {
      const res = await fetch('/api/test/');
      return (await res.json()) as TestItem;
    };

    const { result } = renderHook(() => useGetFn<TestItem>('/api/test/', fetcher), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toEqual({ id: 1, name: 'item' });
    expect(result.current.error).toBeUndefined();
  });

  test('should return error when fetcher throws', async () => {
    const fetcher = () => {
      return Promise.reject(new Error('fetch failed'));
    };

    const { result } = renderHook(() => useGetFn<TestItem>('/api/fail/', fetcher), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBeDefined();
    expect(result.current.data).toBeUndefined();
  });

  test('should provide a working refresh function', async () => {
    let callCount = 0;
    server.use(
      http.get('/api/refresh/', () => {
        callCount++;
        return HttpResponse.json({ id: callCount, name: `call-${callCount}` });
      })
    );

    const fetcher = async () => {
      const res = await fetch('/api/refresh/');
      return (await res.json()) as TestItem;
    };

    const { result } = renderHook(() => useGetFn<TestItem>('/api/refresh/', fetcher), { wrapper });

    await waitFor(() => {
      expect(result.current.data).toBeDefined();
    });

    expect(result.current.data?.name).toBe('call-1');

    result.current.refresh();

    await waitFor(() => {
      expect(result.current.data?.name).toBe('call-2');
    });
  });
});
