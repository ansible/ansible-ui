import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest';
import { useAwxResource } from './useAwxResource';

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
});
