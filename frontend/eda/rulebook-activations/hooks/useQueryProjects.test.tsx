/* eslint-disable i18next/no-literal-string */
import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { useQueryProjectOptions } from './useQueryProjects';

const mockProjects = {
  count: 3,
  results: [
    { id: 1, name: 'Project Alpha' },
    { id: 2, name: 'Project Beta' },
    { id: 3, name: 'Project Gamma' },
  ],
};

const server = setupServer(
  http.get('*/api/eda/v1/projects/', ({ request }) => {
    const url = new URL(request.url);
    const search = url.searchParams.get('name__icontains');
    if (search) {
      const filtered = mockProjects.results.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase())
      );
      return HttpResponse.json({ count: filtered.length, results: filtered });
    }
    return HttpResponse.json(mockProjects);
  })
);

function makeQueryOptions(overrides: { search: string; next?: string }) {
  return { ...overrides, signal: new AbortController().signal };
}

describe('useQueryProjectOptions', () => {
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('should return a callback function', () => {
    const { result } = renderHook(() =>
      useQueryProjectOptions<{ id: number; name: string }, 'name', 'id'>({
        url: '/api/eda/v1/projects/',
        labelKey: 'name',
        valueKey: 'id',
        orderQuery: 'order_by',
      })
    );

    expect(typeof result.current).toBe('function');
  });

  it('should fetch projects and return formatted options', async () => {
    const { result } = renderHook(() =>
      useQueryProjectOptions<{ id: number; name: string }, 'name', 'id'>({
        url: '/api/eda/v1/projects/',
        labelKey: 'name',
        valueKey: 'id',
        orderQuery: 'order_by',
      })
    );

    let queryResult: Awaited<ReturnType<typeof result.current>> | undefined;
    await waitFor(async () => {
      queryResult = await result.current(makeQueryOptions({ search: '' }));
      expect(queryResult).toBeDefined();
    });

    expect(queryResult!.options).toHaveLength(3);
    expect(queryResult!.options[0].label).toBe('Project Alpha');
    expect(queryResult!.remaining).toBe(0);
  });

  it('should pass search parameter to API', async () => {
    const { result } = renderHook(() =>
      useQueryProjectOptions<{ id: number; name: string }, 'name', 'id'>({
        url: '/api/eda/v1/projects/',
        labelKey: 'name',
        valueKey: 'id',
        orderQuery: 'order_by',
      })
    );

    let queryResult: Awaited<ReturnType<typeof result.current>> | undefined;
    await waitFor(async () => {
      queryResult = await result.current(makeQueryOptions({ search: 'Alpha' }));
      expect(queryResult).toBeDefined();
    });

    expect(queryResult!.options).toHaveLength(1);
    expect(queryResult!.options[0].label).toBe('Project Alpha');
  });

  it('should include next cursor from last item', async () => {
    const { result } = renderHook(() =>
      useQueryProjectOptions<{ id: number; name: string }, 'name', 'id'>({
        url: '/api/eda/v1/projects/',
        labelKey: 'name',
        valueKey: 'id',
        orderQuery: 'order_by',
      })
    );

    let queryResult: Awaited<ReturnType<typeof result.current>> | undefined;
    await waitFor(async () => {
      queryResult = await result.current(makeQueryOptions({ search: '' }));
      expect(queryResult).toBeDefined();
    });

    expect(queryResult!.next).toBe('Project Gamma');
  });

  it('should handle next parameter in query', async () => {
    const { result } = renderHook(() =>
      useQueryProjectOptions<{ id: number; name: string }, 'name', 'id'>({
        url: '/api/eda/v1/projects/',
        labelKey: 'name',
        valueKey: 'id',
        orderQuery: 'order_by',
      })
    );

    let queryResult: Awaited<ReturnType<typeof result.current>> | undefined;
    await waitFor(async () => {
      queryResult = await result.current(makeQueryOptions({ search: '', next: 'Project Alpha' }));
      expect(queryResult).toBeDefined();
    });

    expect(queryResult!.options.length).toBeGreaterThan(0);
  });

  it('should handle empty response', async () => {
    server.use(
      http.get('*/api/eda/v1/projects/', () => {
        return HttpResponse.json({ count: 0, results: [] });
      })
    );

    const { result } = renderHook(() =>
      useQueryProjectOptions<{ id: number; name: string }, 'name', 'id'>({
        url: '/api/eda/v1/projects/',
        labelKey: 'name',
        valueKey: 'id',
        orderQuery: 'order_by',
      })
    );

    let queryResult: Awaited<ReturnType<typeof result.current>> | undefined;
    await waitFor(async () => {
      queryResult = await result.current(makeQueryOptions({ search: '' }));
      expect(queryResult).toBeDefined();
    });

    expect(queryResult!.options).toHaveLength(0);
    expect(queryResult!.remaining).toBe(0);
    expect(queryResult!.next).toBe('');
  });
});
