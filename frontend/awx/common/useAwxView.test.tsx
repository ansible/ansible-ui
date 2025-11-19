import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest';
import { SWRConfig } from 'swr';
import { awxAPI } from './api/awx-utils';
import { useAwxView } from './useAwxView';
import { AwxHost } from '../interfaces/AwxHost';
import { ReactNode } from 'react';
import { ToolbarFilterType } from '@ansible/ansible-ui-framework';

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
});
afterAll(() => server.close());

describe('useAwxView', () => {
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

        const { result } = renderHook(
          () =>
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
            }),
          { wrapper }
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

        const { result } = renderHook(
          () =>
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
            }),
          { wrapper }
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
});
