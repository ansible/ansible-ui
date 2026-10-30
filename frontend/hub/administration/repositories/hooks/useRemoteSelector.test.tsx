/* eslint-disable i18next/no-literal-string */
import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { pulpAPI } from '../../../common/api/formatPath';
import { useRemoteFilters } from '../../remotes/hooks/useRemoteFilters';

/**
 * Covers remote list filter hook used by repository remote selection UIs.
 * (No useRemoteSelector module exists in this workspace.)
 */
const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('useRemoteSelector (useRemoteFilters)', () => {
  it('returns name keyword filter', async () => {
    const { result } = renderHook(() => useRemoteFilters());

    await waitFor(() => {
      expect(result.current.length).toBeGreaterThan(0);
    });

    const nameFilter = result.current.find((filter) => filter.key === 'name');
    expect(nameFilter?.label).toBe('Name');
  });

  it('allows remotes API to be queried with filter params', async () => {
    server.use(
      http.get(pulpAPI`/remotes/ansible/collection/`, ({ request }) => {
        const url = new URL(request.url);
        expect(url.searchParams.get('name__icontains')).toBe('test');
        return HttpResponse.json({ count: 0, results: [] });
      })
    );

    await fetch(`${pulpAPI`/remotes/ansible/collection/`}?name__icontains=test`);
  });
});
