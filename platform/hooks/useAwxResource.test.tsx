import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest';
import { getAwxResource, useAwxResource } from './useAwxResource';

const platformResource = {
  id: 1,
  summary_fields: {
    resource: { ansible_id: 'ansible-user-1', resource_type: 'shared.user' },
  },
};

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('useAwxResource', () => {
  test('should return the first matching resource from the AWX API', async () => {
    server.use(
      http.get(
        ({ request }) => {
          const url = new URL(request.url);
          return (
            url.pathname.endsWith('/users') &&
            url.searchParams.get('resource__ansible_id') === 'ansible-user-1'
          );
        },
        () => HttpResponse.json({ count: 1, results: [{ id: 42, name: 'user' }] })
      )
    );

    const { result } = renderHook(() => useAwxResource<{ id: number }>('users', platformResource));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    expect(result.current.resource).toEqual({ id: 42, name: 'user' });
  });

  test('should return undefined when the AWX API returns no matches', async () => {
    server.use(
      http.get(
        ({ request }) => {
          const url = new URL(request.url);
          return url.pathname.endsWith('/users');
        },
        () => HttpResponse.json({ count: 0, results: [] })
      )
    );

    const { result } = renderHook(() => useAwxResource<{ id: number }>('users', platformResource));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    expect(result.current.resource).toBeUndefined();
  });

  test('should fetch the first AWX resource with getAwxResource', async () => {
    server.use(
      http.get(
        ({ request }) => {
          const url = new URL(request.url);
          return (
            url.pathname.endsWith('/users') &&
            url.searchParams.get('resource__ansible_id') === 'ansible-user-1'
          );
        },
        () => HttpResponse.json({ count: 1, results: [{ id: 7, name: 'loaded' }] })
      )
    );

    const resource = await getAwxResource<{ id: number; name: string }>('users', platformResource);

    expect(resource).toEqual({ id: 7, name: 'loaded' });
  });
});
