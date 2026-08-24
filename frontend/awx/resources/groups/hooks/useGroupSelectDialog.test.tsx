import { act, renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { ReactNode } from 'react';
import { SWRConfig } from 'swr';
import { afterAll, afterEach, beforeAll, describe, expect, test, vi } from 'vitest';
import { awxAPI } from '../../../common/api/awx-utils';
import { useAwxView } from '../../../common/useAwxView';
import { InventoryGroup } from '../../../interfaces/InventoryGroup';

vi.mock('../../../common/useAwxConfig', () => ({
  useAwxConfigState: vi.fn(() => ({ serviceDown: false, serviceDownStatusCode: undefined })),
}));

const wrapper = ({ children }: { children: ReactNode }) => (
  <SWRConfig value={{ dedupingInterval: 0, provider: () => new Map(), shouldRetryOnError: false }}>
    {children}
  </SWRConfig>
);

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// Regression coverage for #3252: GroupSelectDialog previously baked its own
// query string into the view `url` (`.../potential_children/?not__id=...&page_size=5`)
// instead of passing `queryParams`. useAwxView appends its own `?sort=...&page=...`
// query string onto `url`, so the hand-built query string produced a URL with two
// `?` separators, which the API could not parse -- breaking search in the dialog.
describe('GroupSelectDialog view URL construction (#3252)', () => {
  test('should request a single well-formed query string, not a double "?" URL', async () => {
    const requestUrls: string[] = [];
    const groupId = '5';
    server.use(
      http.get(awxAPI`/groups/${groupId}/potential_children/`, ({ request }) => {
        requestUrls.push(request.url);
        return HttpResponse.json({ count: 0, next: null, previous: null, results: [] });
      })
    );

    const { result } = renderHook(
      () =>
        useAwxView<InventoryGroup>({
          url: awxAPI`/groups/${groupId}/potential_children/`,
          queryParams: {
            not__id: groupId,
            not__parents: groupId,
          },
        }),
      { wrapper }
    );

    await waitFor(() => {
      expect(requestUrls.length).toBeGreaterThan(0);
    });

    const requestedUrl = requestUrls[0];
    expect(requestedUrl.split('?').length - 1).toBe(1);

    const params = new URL(requestedUrl).searchParams;
    expect(params.get('not__id')).toBe(groupId);
    expect(params.get('not__parents')).toBe(groupId);
    expect(result.current.error).toBeUndefined();
  });

  test('should keep the query string well-formed after paging', async () => {
    const requestUrls: string[] = [];
    const groupId = '5';
    server.use(
      http.get(awxAPI`/groups/${groupId}/potential_children/`, ({ request }) => {
        requestUrls.push(request.url);
        return HttpResponse.json({ count: 25, next: null, previous: null, results: [] });
      })
    );

    const { result } = renderHook(
      () =>
        useAwxView<InventoryGroup>({
          url: awxAPI`/groups/${groupId}/potential_children/`,
          queryParams: {
            not__id: groupId,
            not__parents: groupId,
          },
        }),
      { wrapper }
    );

    await waitFor(() => {
      expect(requestUrls.length).toBeGreaterThan(0);
    });

    act(() => {
      result.current.setPage(2);
    });

    await waitFor(() => {
      expect(requestUrls.some((url) => url.includes('page=2'))).toBe(true);
    });

    const pagedUrl = requestUrls[requestUrls.length - 1];
    expect(pagedUrl.split('?').length - 1).toBe(1);
    const params = new URL(pagedUrl).searchParams;
    expect(params.get('not__id')).toBe(groupId);
    expect(params.get('not__parents')).toBe(groupId);
  });
});
