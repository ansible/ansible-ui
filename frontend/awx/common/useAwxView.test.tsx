import { act, renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, test, vi } from 'vitest';
import { awxAPI } from './api/awx-utils';
import { useAwxView, compareByField } from './useAwxView';
import { AwxHost } from '../interfaces/AwxHost';
import { ToolbarFilterType } from '@ansible/ansible-ui-framework';

vi.mock('./useAwxConfig', () => ({
  useAwxConfigState: vi.fn(() => ({
    serviceDown: false,
    serviceDownStatusCode: undefined,
  })),
}));

import { useAwxConfigState } from './useAwxConfig';

const mockHosts: AwxHost[] = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  name: `host-${i + 1}`,
  description: `Description ${i + 1}`,
  inventory: 1,
  enabled: true,
  instance_id: '',
  variables: '',
  created: '2024-01-01T00:00:00Z',
  modified: '2024-01-01T00:00:00Z',
  last_job: undefined,
  last_job_host_summary: undefined,
  summary_fields: {
    inventory: { id: 1, name: 'Test Inventory', kind: '' },
    groups: {
      count: 0,
      results: [],
    },
    recent_jobs: [],
    user_capabilities: {
      edit: true,
      delete: true,
    },
    created_by: {
      id: 1,
      username: 'admin',
    },
    modified_by: {
      id: 1,
      username: 'admin',
    },
  },
}));

const createMockResponse = (page: number, count = 40) => ({
  count,
  next: page === 1 ? '/api/v2/hosts/?page=2' : null,
  previous: page === 2 ? '/api/v2/hosts/?page=1' : null,
  results: mockHosts,
});

let page2ErrorTriggered = false;

const server = setupServer(
  http.get(awxAPI`/hosts/`, ({ request }) => {
    const url = new URL(request.url);
    const page = url.searchParams.get('page') || '1';
    const nameFilter = url.searchParams.get('name__icontains');

    if (page === '2' && page2ErrorTriggered) {
      return HttpResponse.json({ detail: 'Invalid page.' }, { status: 400 });
    }

    if (nameFilter) {
      return HttpResponse.json({
        count: 5,
        next: null,
        previous: null,
        results: mockHosts.slice(0, 5),
      });
    }

    return HttpResponse.json(createMockResponse(parseInt(page)));
  })
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => {
  server.resetHandlers();
  page2ErrorTriggered = false;
  vi.mocked(useAwxConfigState).mockReturnValue({
    serviceDown: false,
    serviceDownStatusCode: undefined,
  });
});
afterAll(() => server.close());

describe('useAwxView', () => {
  describe('Next-page prefetch removed (AAP-78172)', () => {
    test('should not prefetch the next page URL from the API response', async () => {
      const requestUrls: string[] = [];
      server.use(
        http.get(awxAPI`/hosts/`, ({ request }) => {
          requestUrls.push(new URL(request.url).pathname + new URL(request.url).search);
          return HttpResponse.json({
            count: 40,
            next: '/api/v2/hosts/?page=2',
            previous: null,
            results: mockHosts,
          });
        })
      );

      const { result } = renderHook(() =>
        useAwxView<AwxHost>({
          url: '/api/v2/hosts/',
          disableQueryString: true,
        })
      );

      await waitFor(() => {
        expect(result.current.pageItems).toBeDefined();
        expect(result.current.itemCount).toBe(40);
      });

      expect(requestUrls.some((url) => url.includes('page=2'))).toBe(false);
    });

    test('should not prefetch next page when refresh is called', async () => {
      const requestUrls: string[] = [];
      server.use(
        http.get(awxAPI`/hosts/`, ({ request }) => {
          requestUrls.push(new URL(request.url).pathname + new URL(request.url).search);
          return HttpResponse.json({
            count: 40,
            next: '/api/v2/hosts/?page=2',
            previous: null,
            results: mockHosts,
          });
        })
      );

      const { result } = renderHook(() =>
        useAwxView<AwxHost>({
          url: '/api/v2/hosts/',
          disableQueryString: true,
        })
      );

      await waitFor(() => {
        expect(result.current.pageItems).toBeDefined();
      });

      requestUrls.length = 0;
      await act(async () => {
        await result.current.refresh();
      });

      await waitFor(() => {
        expect(requestUrls.length).toBeGreaterThan(0);
      });

      expect(requestUrls.some((url) => url.includes('page=2'))).toBe(false);
    });
  });

  describe('upsertItem', () => {
    test('should update an existing item in the list', async () => {
      const { result } = renderHook(() =>
        useAwxView<AwxHost>({
          url: '/api/v2/hosts/',
          disableQueryString: true,
        })
      );

      await waitFor(() => {
        expect(result.current.pageItems).toBeDefined();
        expect(result.current.pageItems!.length).toBe(20);
      });

      const updatedHost = { ...result.current.pageItems![0], name: 'updated-host' };
      act(() => {
        result.current.upsertItem(updatedHost);
      });

      expect(result.current.pageItems![0].name).toBe('updated-host');
      expect(result.current.pageItems!.length).toBe(20);
    });

    test('should prepend a new item to the list', async () => {
      const { result } = renderHook(() =>
        useAwxView<AwxHost>({
          url: '/api/v2/hosts/',
          disableQueryString: true,
        })
      );

      await waitFor(() => {
        expect(result.current.pageItems).toBeDefined();
        expect(result.current.pageItems!.length).toBe(20);
      });

      const newHost = { ...mockHosts[0], id: 9999, name: 'new-host' };
      act(() => {
        result.current.upsertItem(newHost);
      });

      expect(result.current.pageItems!.length).toBe(21);
      expect(result.current.pageItems![0].id).toBe(9999);
      expect(result.current.pageItems![0].name).toBe('new-host');
    });
  });

  describe('Error handling for pagination', () => {
    describe('Filter with pagination error recovery', () => {
      test('should reset to page 1 when filter returns 400 on page 2', async () => {
        server.use(
          http.get(awxAPI`/hosts/`, ({ request }) => {
            const url = new URL(request.url);
            const page = url.searchParams.get('page') || '1';
            const nameFilter = url.searchParams.get('name__icontains');

            if (nameFilter && page === '2') {
              return HttpResponse.json({ detail: 'Invalid page.' }, { status: 400 });
            }

            if (nameFilter) {
              return HttpResponse.json({
                count: 5,
                next: null,
                previous: null,
                results: mockHosts.slice(0, 5),
              });
            }

            return HttpResponse.json(createMockResponse(parseInt(page)));
          })
        );

        const { result } = renderHook(() =>
          useAwxView<AwxHost>({
            url: '/api/v2/hosts/',
            disableQueryString: true,
            toolbarFilters: [
              {
                key: 'name',
                label: 'Name',
                type: ToolbarFilterType.Search,
                query: 'name__icontains',
              },
            ],
          })
        );

        await waitFor(() => {
          expect(result.current.pageItems).toBeDefined();
          expect(result.current.itemCount).toBe(40);
        });

        result.current.setPage(2);

        await waitFor(() => {
          expect(result.current.page).toBe(2);
        });

        result.current.setFilterState({ name: ['test'] });

        await waitFor(() => {
          expect(result.current.page).toBe(1);
          expect(result.current.itemCount).toBe(5);
        });
      });

      test('should reset to page 1 when filter returns 404 on page 2', async () => {
        server.use(
          http.get(awxAPI`/hosts/`, ({ request }) => {
            const url = new URL(request.url);
            const page = url.searchParams.get('page') || '1';
            const nameFilter = url.searchParams.get('name__icontains');

            if (nameFilter && page === '2') {
              return HttpResponse.json({ detail: 'Not found.' }, { status: 404 });
            }

            if (nameFilter) {
              return HttpResponse.json({
                count: 5,
                next: null,
                previous: null,
                results: mockHosts.slice(0, 5),
              });
            }

            return HttpResponse.json(createMockResponse(parseInt(page)));
          })
        );

        const { result } = renderHook(() =>
          useAwxView<AwxHost>({
            url: '/api/v2/hosts/',
            disableQueryString: true,
            toolbarFilters: [
              {
                key: 'name',
                label: 'Name',
                type: ToolbarFilterType.Search,
                query: 'name__icontains',
              },
            ],
          })
        );

        await waitFor(() => {
          expect(result.current.pageItems).toBeDefined();
          expect(result.current.itemCount).toBe(40);
        });

        result.current.setPage(2);

        await waitFor(() => {
          expect(result.current.page).toBe(2);
        });

        result.current.setFilterState({ name: ['test'] });

        await waitFor(() => {
          expect(result.current.page).toBe(1);
          expect(result.current.itemCount).toBe(5);
        });
      });
    });
  });

  describe('serviceDown flag', () => {
    test('should not fetch when serviceDown is true', async () => {
      const requestUrls: string[] = [];
      server.use(
        http.get(awxAPI`/hosts/`, ({ request }) => {
          requestUrls.push(new URL(request.url).href);
          return HttpResponse.json(createMockResponse(1));
        })
      );

      vi.mocked(useAwxConfigState).mockReturnValue({
        serviceDown: true,
        serviceDownStatusCode: 503,
      });

      const { result } = renderHook(() =>
        useAwxView<AwxHost>({
          url: '/api/v2/hosts/',
          disableQueryString: true,
        })
      );

      expect(result.current.error).toBeDefined();
      expect(result.current.pageItems).toBeUndefined();

      await act(async () => {});

      expect(requestUrls).toHaveLength(0);
    });

    test('should return error when serviceDown is true', () => {
      vi.mocked(useAwxConfigState).mockReturnValue({
        serviceDown: true,
        serviceDownStatusCode: 503,
      });

      const { result } = renderHook(() =>
        useAwxView<AwxHost>({
          url: '/api/v2/hosts/',
          disableQueryString: true,
        })
      );

      expect(result.current.error).toBeDefined();
      expect((result.current.error as Error).message).toContain(
        'Controller service is unavailable'
      );
      expect((result.current.error as Error).message).toContain('503');
    });

    test('should include status code in error message', () => {
      vi.mocked(useAwxConfigState).mockReturnValue({
        serviceDown: true,
        serviceDownStatusCode: 502,
      });

      const { result } = renderHook(() =>
        useAwxView<AwxHost>({
          url: '/api/v2/hosts/',
          disableQueryString: true,
        })
      );

      expect((result.current.error as Error).message).toBe(
        'Controller service is unavailable (HTTP 502)'
      );
    });

    test('should show generic message when serviceDown is true but no status code', () => {
      vi.mocked(useAwxConfigState).mockReturnValue({
        serviceDown: true,
        serviceDownStatusCode: undefined,
      });

      const { result } = renderHook(() =>
        useAwxView<AwxHost>({
          url: '/api/v2/hosts/',
          disableQueryString: true,
        })
      );

      expect(result.current.error).toBeDefined();
      expect((result.current.error as Error).message).toBe('Controller service is unavailable');
    });

    test('should resume fetching when serviceDown becomes false', async () => {
      vi.mocked(useAwxConfigState).mockReturnValue({
        serviceDown: true,
        serviceDownStatusCode: 503,
      });

      const { result, rerender } = renderHook(() =>
        useAwxView<AwxHost>({
          url: '/api/v2/hosts/',
          disableQueryString: true,
        })
      );

      expect(result.current.error).toBeDefined();
      expect(result.current.pageItems).toBeUndefined();

      vi.mocked(useAwxConfigState).mockReturnValue({
        serviceDown: false,
        serviceDownStatusCode: undefined,
      });

      rerender();

      await waitFor(() => {
        expect(result.current.pageItems).toBeDefined();
        expect(result.current.itemCount).toBe(40);
      });

      expect(result.current.error).toBeUndefined();
    });

    test('should handle other RequestError types beyond 404/400', async () => {
      server.use(
        http.get(awxAPI`/hosts/`, () => {
          return HttpResponse.json({ detail: 'Internal server error.' }, { status: 500 });
        })
      );

      const { result } = renderHook(() =>
        useAwxView<AwxHost>({
          url: '/api/v2/hosts/',
          disableQueryString: true,
        })
      );

      await waitFor(() => {
        expect(result.current.error).toBeDefined();
      });

      // For non-404/400 errors, should not reset page and should propagate the error
      expect(result.current.page).toBe(1); // Should remain at current page
      expect(result.current.error).toBeDefined();
    });

    test('should handle regular response errors (not RequestError)', async () => {
      server.use(
        http.get(awxAPI`/hosts/`, () => {
          // Return a network error or other non-RequestError
          return HttpResponse.error();
        })
      );

      const { result } = renderHook(() =>
        useAwxView<AwxHost>({
          url: '/api/v2/hosts/',
          disableQueryString: true,
        })
      );

      await waitFor(() => {
        expect(result.current.error).toBeDefined();
      });

      // Should propagate the error without special handling
      expect(result.current.error).toBeDefined();
    });
  });

  describe('Table columns default sort', () => {
    test('should use defaultSort column when provided', async () => {
      const { result } = renderHook(() =>
        useAwxView<AwxHost>({
          url: '/api/v2/hosts/',
          disableQueryString: true,
          tableColumns: [
            { header: 'Name', cell: () => '', sort: 'name' },
            { header: 'Created', cell: () => '', sort: 'created', defaultSort: true },
          ],
        })
      );

      await waitFor(() => {
        expect(result.current.pageItems).toBeDefined();
      });

      expect(result.current.sort).toBe('created');
    });

    test('should use first column for sort when no defaultSort specified', async () => {
      const { result } = renderHook(() =>
        useAwxView<AwxHost>({
          url: '/api/v2/hosts/',
          disableQueryString: true,
          tableColumns: [
            { header: 'Name', cell: () => '', sort: 'name' },
            { header: 'Created', cell: () => '', sort: 'created' },
          ],
        })
      );

      await waitFor(() => {
        expect(result.current.pageItems).toBeDefined();
      });

      expect(result.current.sort).toBe('name');
    });
  });

  describe('Item management', () => {
    test('should update item in the list', async () => {
      const { result } = renderHook(() =>
        useAwxView<AwxHost>({
          url: '/api/v2/hosts/',
          disableQueryString: true,
        })
      );

      await waitFor(() => {
        expect(result.current.pageItems).toBeDefined();
        expect(result.current.pageItems?.length).toBeGreaterThan(0);
      });

      const originalItem = result.current.pageItems?.[0];
      expect(originalItem).toBeDefined();

      if (originalItem) {
        const updatedItem = { ...originalItem, name: 'updated-host-name' };

        act(() => {
          result.current.updateItem(updatedItem);
        });

        expect(result.current.pageItems?.[0].name).toBe('updated-host-name');
      }
    });

    test('should not update item if items list is undefined', () => {
      const { result } = renderHook(() =>
        useAwxView<AwxHost>({
          url: '/api/v2/hosts/',
          disableQueryString: true,
        })
      );

      // Call updateItem before items are loaded
      act(() => {
        result.current.updateItem({ id: 999, name: 'test' } as AwxHost);
      });

      // Should not throw an error
      expect(result.current.pageItems).toBeUndefined();
    });

    test('should not update item if item not found in list', async () => {
      const { result } = renderHook(() =>
        useAwxView<AwxHost>({
          url: '/api/v2/hosts/',
          disableQueryString: true,
        })
      );

      await waitFor(() => {
        expect(result.current.pageItems).toBeDefined();
      });

      const originalCount = result.current.pageItems?.length;

      act(() => {
        result.current.updateItem({ id: 999, name: 'non-existent' } as AwxHost);
      });

      expect(result.current.pageItems?.length).toBe(originalCount);
    });
  });

  describe('Selection with refresh', () => {
    test('should select items and refresh', async () => {
      const { result } = renderHook(() =>
        useAwxView<AwxHost>({
          url: '/api/v2/hosts/',
          disableQueryString: true,
        })
      );

      await waitFor(() => {
        expect(result.current.pageItems).toBeDefined();
        expect(result.current.pageItems?.length).toBeGreaterThan(0);
      });

      const itemsToSelect = result.current.pageItems?.slice(0, 2) || [];

      act(() => {
        result.current.selectItemsAndRefresh(itemsToSelect);
      });

      expect(result.current.selectedItems).toHaveLength(2);
    });

    test('should unselect items and refresh', async () => {
      const { result } = renderHook(() =>
        useAwxView<AwxHost>({
          url: '/api/v2/hosts/',
          disableQueryString: true,
        })
      );

      await waitFor(() => {
        expect(result.current.pageItems).toBeDefined();
        expect(result.current.pageItems?.length).toBeGreaterThan(0);
      });

      const itemsToSelect = result.current.pageItems?.slice(0, 2) || [];

      // First select items
      act(() => {
        result.current.selectItemsAndRefresh(itemsToSelect);
      });

      expect(result.current.selectedItems).toHaveLength(2);

      // Then unselect them
      act(() => {
        result.current.unselectItemsAndRefresh(itemsToSelect);
      });

      expect(result.current.selectedItems).toHaveLength(0);
    });
  });

  describe('Data handling edge cases', () => {
    test('should handle API response without count field', async () => {
      server.use(
        http.get(awxAPI`/hosts/`, () => {
          return HttpResponse.json({
            // Omit count field
            next: null,
            previous: null,
            results: mockHosts.slice(0, 5),
          });
        })
      );

      const { result } = renderHook(() =>
        useAwxView<AwxHost>({
          url: '/api/v2/hosts/',
          disableQueryString: true,
        })
      );

      await waitFor(() => {
        expect(result.current.pageItems).toBeDefined();
      });

      // itemCount should remain undefined when API doesn't provide count
      expect(result.current.itemCount).toBeUndefined();
      expect(result.current.pageItems).toHaveLength(5);
    });

    test('should handle empty results array', async () => {
      server.use(
        http.get(awxAPI`/hosts/`, () => {
          return HttpResponse.json({
            count: 0,
            next: null,
            previous: null,
            results: [],
          });
        })
      );

      const { result } = renderHook(() =>
        useAwxView<AwxHost>({
          url: '/api/v2/hosts/',
          disableQueryString: true,
        })
      );

      await waitFor(() => {
        expect(result.current.pageItems).toEqual([]);
      });

      expect(result.current.itemCount).toBe(0);
      expect(result.current.pageItems).toHaveLength(0);
    });

    test('should handle refresh method when data is available', async () => {
      let requestCount = 0;
      server.use(
        http.get(awxAPI`/hosts/`, () => {
          requestCount++;
          return HttpResponse.json(createMockResponse(1));
        })
      );

      const { result } = renderHook(() =>
        useAwxView<AwxHost>({
          url: '/api/v2/hosts/',
          disableQueryString: true,
        })
      );

      await waitFor(() => {
        expect(result.current.pageItems).toBeDefined();
      });

      const initialRequestCount = requestCount;

      // Call refresh explicitly
      await act(async () => {
        await result.current.refresh();
      });

      await waitFor(() => {
        expect(requestCount).toBe(initialRequestCount + 1);
      });

      expect(result.current.pageItems).toBeDefined();
    });

    test('should handle default selection when provided', async () => {
      const { result } = renderHook(() =>
        useAwxView<AwxHost>({
          url: '/api/v2/hosts/',
          disableQueryString: true,
          defaultSelection: [mockHosts[0], mockHosts[1]],
        })
      );

      await waitFor(() => {
        expect(result.current.pageItems).toBeDefined();
      });

      // Should start with the default selection
      expect(result.current.selectedItems).toHaveLength(2);
      expect(result.current.selectedItems.map((item) => item.id)).toEqual([1, 2]);
    });
  });
});

describe('compareByField', () => {
  const items = [
    { id: 1, name: 'Demo Template', started: '2026-06-01T10:00:00Z', priority: 3 },
    { id: 2, name: 'chatty tasks', started: '2026-06-02T10:00:00Z', priority: 1 },
    { id: 3, name: 'Test Playbooks', started: '2026-06-01T12:00:00Z', priority: 2 },
  ];

  test('should sort strings case-insensitively ascending', () => {
    const sorted = [...items].sort((a, b) => compareByField(a, b, 'name', 'asc'));
    expect(sorted.map((i) => i.name)).toEqual(['chatty tasks', 'Demo Template', 'Test Playbooks']);
  });

  test('should sort strings case-insensitively descending', () => {
    const sorted = [...items].sort((a, b) => compareByField(a, b, 'name', 'desc'));
    expect(sorted.map((i) => i.name)).toEqual(['Test Playbooks', 'Demo Template', 'chatty tasks']);
  });

  test('should sort numbers ascending', () => {
    const sorted = [...items].sort((a, b) => compareByField(a, b, 'priority', 'asc'));
    expect(sorted.map((i) => i.priority)).toEqual([1, 2, 3]);
  });

  test('should sort numbers descending', () => {
    const sorted = [...items].sort((a, b) => compareByField(a, b, 'priority', 'desc'));
    expect(sorted.map((i) => i.priority)).toEqual([3, 2, 1]);
  });

  test('should sort date strings ascending', () => {
    const sorted = [...items].sort((a, b) => compareByField(a, b, 'started', 'asc'));
    expect(sorted.map((i) => i.id)).toEqual([1, 3, 2]);
  });

  test('should sort date strings descending', () => {
    const sorted = [...items].sort((a, b) => compareByField(a, b, 'started', 'desc'));
    expect(sorted.map((i) => i.id)).toEqual([2, 3, 1]);
  });

  test('should treat null/undefined values as neutral', () => {
    const withNulls = [
      { id: 1, name: 'Bravo' },
      { id: 2, name: null },
      { id: 3, name: 'Alpha' },
    ];
    const sorted = [...withNulls].sort((a, b) => compareByField(a, b, 'name', 'asc'));
    expect(sorted.map((i) => i.id)).toEqual([1, 2, 3]);
  });

  test('should default to ascending when direction is omitted', () => {
    const sorted = [...items].sort((a, b) => compareByField(a, b, 'priority'));
    expect(sorted.map((i) => i.priority)).toEqual([1, 2, 3]);
  });
});
