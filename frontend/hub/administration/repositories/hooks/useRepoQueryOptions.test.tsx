/* eslint-disable i18next/no-literal-string */
import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { pulpAPI } from '../../../common/api/formatPath';
import { useRepoQueryOptions } from './useRepoQueryOptions';

const server = setupServer(
  http.get(pulpAPI`/repositories/ansible/ansible/`, () =>
    HttpResponse.json({
      count: 2,
      results: [
        { name: 'published', description: '' },
        { name: 'staging', description: '' },
      ],
    })
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('useRepoQueryOptions', () => {
  it('loads repository options for async select', async () => {
    const { result } = renderHook(() => useRepoQueryOptions());

    const loadOptions = result.current;
    const response = await loadOptions({
      next: undefined,
      search: '',
      signal: new AbortController().signal,
    });

    await waitFor(() => {
      expect(response.options).toEqual([
        { label: 'published', value: 'published' },
        { label: 'staging', value: 'staging' },
      ]);
    });
    expect(response.remaining).toBe(0);
  });

  it('passes search filter to repository API', async () => {
    server.use(
      http.get(pulpAPI`/repositories/ansible/ansible/`, ({ request }) => {
        const url = new URL(request.url);
        expect(url.searchParams.get('name__icontains')).toBe('pub');
        return HttpResponse.json({
          count: 1,
          results: [{ name: 'published', description: '' }],
        });
      })
    );

    const { result } = renderHook(() => useRepoQueryOptions());
    const response = await result.current({
      next: undefined,
      search: 'pub',
      signal: new AbortController().signal,
    });

    expect(response.options).toEqual([{ label: 'published', value: 'published' }]);
  });
});
