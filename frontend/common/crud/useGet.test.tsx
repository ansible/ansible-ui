import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { ReactNode } from 'react';
import { SWRConfig } from 'swr';
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest';
import { useGet, useGetItem } from './useGet';

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

describe('useGet', () => {
  test('should fetch data successfully', async () => {
    const mockData: TestItem = { id: 1, name: 'test' };
    server.use(
      http.get('/api/test/', () => {
        return HttpResponse.json(mockData);
      })
    );

    const { result } = renderHook(() => useGet<TestItem>('/api/test/'), { wrapper });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toEqual(mockData);
    expect(result.current.error).toBeUndefined();
  });

  test('should return error on API failure', async () => {
    server.use(
      http.get('/api/test-error/', () => {
        return HttpResponse.json({ detail: 'Not found' }, { status: 404 });
      })
    );

    const { result } = renderHook(() => useGet<TestItem>('/api/test-error/'), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBeDefined();
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.data).toBeUndefined();
  });

  test('should suppress error while still loading', async () => {
    server.use(
      http.get('/api/slow-fail/', async () => {
        await new Promise((resolve) => setTimeout(resolve, 50));
        return HttpResponse.json({ detail: 'Fail' }, { status: 500 });
      })
    );

    const { result } = renderHook(() => useGet<TestItem>('/api/slow-fail/'), { wrapper });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.error).toBeUndefined();

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBeDefined();
  });

  test('should not fetch when url is undefined', () => {
    const { result } = renderHook(() => useGet<TestItem>(undefined), { wrapper });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBeUndefined();
    expect(result.current.error).toBeUndefined();
  });

  test('should append query parameters to the URL', async () => {
    server.use(
      http.get('/api/items/', ({ request }) => {
        const url = new URL(request.url);
        const page = url.searchParams.get('page');
        return HttpResponse.json({ id: 1, name: `page-${page}` });
      })
    );

    const { result } = renderHook(() => useGet<TestItem>('/api/items/', { page: 2 }), { wrapper });

    await waitFor(() => {
      expect(result.current.data).toBeDefined();
    });

    expect(result.current.data?.name).toBe('page-2');
  });

  test('should provide a working refresh function', async () => {
    let callCount = 0;
    server.use(
      http.get('/api/refreshable/', () => {
        callCount++;
        return HttpResponse.json({ id: callCount, name: `call-${callCount}` });
      })
    );

    const { result } = renderHook(() => useGet<TestItem>('/api/refreshable/'), { wrapper });

    await waitFor(() => {
      expect(result.current.data).toBeDefined();
    });

    expect(result.current.data?.name).toBe('call-1');

    result.current.refresh();

    await waitFor(() => {
      expect(result.current.data?.name).toBe('call-2');
    });
  });

  test('should allow custom swrConfiguration overrides', async () => {
    server.use(
      http.get('/api/custom-config/', () => {
        return HttpResponse.json({ id: 1, name: 'custom' });
      })
    );

    const { result } = renderHook(
      () => useGet<TestItem>('/api/custom-config/', undefined, { refreshInterval: 0 }),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.data).toBeDefined();
    });

    expect(result.current.data?.name).toBe('custom');
  });
});

describe('useGetItem', () => {
  test('should fetch item by id', async () => {
    const mockItem: TestItem = { id: 42, name: 'item-42' };
    server.use(
      http.get('/api/items/42/', () => {
        return HttpResponse.json(mockItem);
      })
    );

    const { result } = renderHook(() => useGetItem<TestItem>('/api/items/', 42), { wrapper });

    await waitFor(() => {
      expect(result.current.data).toBeDefined();
    });

    expect(result.current.data).toEqual(mockItem);
  });

  test('should not fetch when id is undefined', () => {
    const { result } = renderHook(() => useGetItem<TestItem>('/api/items/'), { wrapper });

    expect(result.current.data).toBeUndefined();
  });

  test('should strip trailing slash from base url before appending id', async () => {
    const mockItem: TestItem = { id: 5, name: 'item-5' };
    server.use(
      http.get('/api/items/5/', () => {
        return HttpResponse.json(mockItem);
      })
    );

    const { result } = renderHook(() => useGetItem<TestItem>('/api/items/', 5), { wrapper });

    await waitFor(() => {
      expect(result.current.data).toEqual(mockItem);
    });
  });

  test('should accept string id', async () => {
    const mockItem: TestItem = { id: 0, name: 'string-id-item' };
    server.use(
      http.get('/api/items/abc-123/', () => {
        return HttpResponse.json(mockItem);
      })
    );

    const { result } = renderHook(() => useGetItem<TestItem>('/api/items', 'abc-123'), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.data).toBeDefined();
    });

    expect(result.current.data?.name).toBe('string-id-item');
  });
});
