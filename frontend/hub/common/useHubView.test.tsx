import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { ReactNode } from 'react';
import { SWRConfig } from 'swr';
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest';
import { hubAPI } from './api/formatPath';
import { useHubView } from './useHubView';

interface TestCollection {
  name: string;
  namespace: string;
  version: string;
}

const mockCollections: TestCollection[] = Array.from({ length: 10 }, (_, i) => ({
  name: `collection-${i + 1}`,
  namespace: `namespace-${i + 1}`,
  version: '1.0.0',
}));

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

describe('useHubView', () => {
  test('should fetch and return paginated data (PulpItemsResponse format)', async () => {
    server.use(
      http.get(hubAPI`/collections/`, () => {
        return HttpResponse.json({
          count: 20,
          next: null,
          results: mockCollections,
        });
      })
    );

    const { result } = renderHook(
      () =>
        useHubView<TestCollection>({
          url: hubAPI`/collections/`,
          keyFn: (item) => item.name,
          disableQueryString: true,
        }),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.pageItems).toBeDefined();
    });

    expect(result.current.pageItems).toHaveLength(10);
    expect(result.current.itemCount).toBe(20);
    expect(result.current.error).toBeUndefined();
  });

  test('should fetch and return data in HubItemsResponse format', async () => {
    server.use(
      http.get(hubAPI`/collections/`, () => {
        return HttpResponse.json({
          meta: { count: 10 },
          links: { next: undefined },
          data: mockCollections,
        });
      })
    );

    const { result } = renderHook(
      () =>
        useHubView<TestCollection>({
          url: hubAPI`/collections/`,
          keyFn: (item) => item.name,
          disableQueryString: true,
        }),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.pageItems).toBeDefined();
    });

    expect(result.current.pageItems).toHaveLength(10);
    expect(result.current.itemCount).toBe(10);
  });

  test('should reset to page 1 when API returns 404 on page > 1', async () => {
    server.use(
      http.get(hubAPI`/collections/`, ({ request }) => {
        const url = new URL(request.url);
        const page = url.searchParams.get('page') || '1';

        if (page !== '1') {
          return HttpResponse.json({ detail: 'Not found' }, { status: 404 });
        }

        return HttpResponse.json({
          count: 20,
          next: '/api/galaxy/collections/?page=2',
          results: mockCollections,
        });
      })
    );

    const { result } = renderHook(
      () =>
        useHubView<TestCollection>({
          url: hubAPI`/collections/`,
          keyFn: (item) => item.name,
          disableQueryString: true,
        }),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.pageItems).toBeDefined();
      expect(result.current.itemCount).toBe(20);
    });

    result.current.setPage(2);

    await waitFor(() => {
      expect(result.current.page).toBe(1);
    });
  });

  test('should handle API error', async () => {
    server.use(
      http.get(hubAPI`/collections/`, () => {
        return HttpResponse.json({ detail: 'Server Error' }, { status: 500 });
      })
    );

    const { result } = renderHook(
      () =>
        useHubView<TestCollection>({
          url: hubAPI`/collections/`,
          keyFn: (item) => item.name,
          disableQueryString: true,
        }),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.error).toBeDefined();
    });
  });

  test('should provide a working refresh function', async () => {
    let callCount = 0;
    server.use(
      http.get(hubAPI`/collections/`, () => {
        callCount++;
        return HttpResponse.json({
          count: callCount,
          next: null,
          results: mockCollections.slice(0, callCount),
        });
      })
    );

    const { result } = renderHook(
      () =>
        useHubView<TestCollection>({
          url: hubAPI`/collections/`,
          keyFn: (item) => item.name,
          disableQueryString: true,
        }),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.pageItems).toBeDefined();
      expect(result.current.itemCount).toBe(1);
    });

    await result.current.refresh();

    await waitFor(() => {
      expect(result.current.itemCount).toBe(2);
    });
  });

  test('should update an item in the list via updateItem', async () => {
    server.use(
      http.get(hubAPI`/collections/`, () => {
        return HttpResponse.json({
          count: 10,
          next: null,
          results: mockCollections,
        });
      })
    );

    const { result } = renderHook(
      () =>
        useHubView<TestCollection>({
          url: hubAPI`/collections/`,
          keyFn: (item) => item.name,
          disableQueryString: true,
        }),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.pageItems).toBeDefined();
    });

    const updatedItem: TestCollection = {
      name: 'collection-1',
      namespace: 'updated-namespace',
      version: '2.0.0',
    };

    result.current.updateItem(updatedItem);

    await waitFor(() => {
      const item = result.current.pageItems?.find((i) => i.name === 'collection-1');
      expect(item?.version).toBe('2.0.0');
      expect(item?.namespace).toBe('updated-namespace');
    });
  });

  test('should handle selection and unselectItemsAndRefresh', async () => {
    server.use(
      http.get(hubAPI`/collections/`, () => {
        return HttpResponse.json({
          count: 10,
          next: null,
          results: mockCollections,
        });
      })
    );

    const { result } = renderHook(
      () =>
        useHubView<TestCollection>({
          url: hubAPI`/collections/`,
          keyFn: (item) => item.name,
          disableQueryString: true,
        }),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.pageItems).toBeDefined();
    });

    expect(result.current.selectedItems).toEqual([]);

    result.current.selectItem(mockCollections[0]);

    await waitFor(() => {
      expect(result.current.selectedItems).toHaveLength(1);
    });

    result.current.unselectItemsAndRefresh([mockCollections[0]]);

    await waitFor(() => {
      expect(result.current.selectedItems).toHaveLength(0);
    });
  });
});
