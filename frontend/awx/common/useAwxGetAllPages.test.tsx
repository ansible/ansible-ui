import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { awxAPI } from './api/awx-utils';
import { useAwxGetAllPages } from './useAwxGetAllPages';

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('useAwxGetAllPages', () => {
  it('should return undefined results when url is undefined', async () => {
    const { result } = renderHook(() => useAwxGetAllPages<{ id: number }>(undefined));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.results).toBeUndefined();
    expect(result.current.error).toBeUndefined();
  });

  it('should return empty string url as no-fetch (treats as falsy)', async () => {
    const { result } = renderHook(() => useAwxGetAllPages<{ id: number }>(''));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.results).toBeUndefined();
  });

  it('should fetch and return flattened results from a single page', async () => {
    server.use(
      http.get(awxAPI`/inventories/`, () =>
        HttpResponse.json({
          count: 2,
          next: null,
          previous: null,
          results: [
            { id: 1, name: 'inventory-a' },
            { id: 2, name: 'inventory-b' },
          ],
        })
      )
    );

    const { result } = renderHook(() =>
      useAwxGetAllPages<{ id: number; name: string }>(awxAPI`/inventories/`)
    );

    await waitFor(() => {
      expect(result.current.results).toBeDefined();
    });

    expect(result.current.results?.[0]).toMatchObject({ id: 1, name: 'inventory-a' });
    expect(result.current.results?.[1]).toMatchObject({ id: 2, name: 'inventory-b' });
    expect(result.current.error).toBeUndefined();
  });

  it('should fetch all pages and concatenate results when next is present', async () => {
    // Use a distinct path to avoid SWR cache from other tests in this suite.
    // With initialSize: 200, all 200 pages are fetched simultaneously (previousPageData
    // is null for every page on the initial load). Pages > 2 must return empty results
    // so the final flattened array contains exactly the items from pages 1 and 2.
    let callCount = 0;
    server.use(
      http.get(awxAPI`/projects/`, ({ request }) => {
        callCount++;
        const page = new URL(request.url).searchParams.get('page') ?? '1';
        if (page === '1') {
          return HttpResponse.json({
            count: 4,
            next: '/api/controller/v2/projects/?page=2&page_size=200',
            previous: null,
            results: [
              { id: 1, name: 'project-a' },
              { id: 2, name: 'project-b' },
            ],
          });
        }
        if (page === '2') {
          return HttpResponse.json({
            count: 4,
            next: null,
            previous: null,
            results: [
              { id: 3, name: 'project-c' },
              { id: 4, name: 'project-d' },
            ],
          });
        }
        return HttpResponse.json({ count: 0, next: null, previous: null, results: [] });
      })
    );

    const { result } = renderHook(() =>
      useAwxGetAllPages<{ id: number; name: string }>(awxAPI`/projects/`)
    );

    await waitFor(
      () => {
        expect(result.current.results).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ id: 1, name: 'project-a' }),
            expect.objectContaining({ id: 2, name: 'project-b' }),
            expect.objectContaining({ id: 3, name: 'project-c' }),
            expect.objectContaining({ id: 4, name: 'project-d' }),
          ])
        );
      },
      { timeout: 10000 }
    );

    expect(callCount).toBeGreaterThanOrEqual(2);
  });

  it('should expose an error when the request fails', async () => {
    // Use a distinct path to avoid SWR cache from the single-page success test above.
    server.use(
      http.get(awxAPI`/credentials/`, () =>
        HttpResponse.json({ detail: 'Server Error' }, { status: 500 })
      )
    );

    const { result } = renderHook(() => useAwxGetAllPages<{ id: number }>(awxAPI`/credentials/`));

    await waitFor(() => {
      expect(result.current.error).toBeDefined();
    });
  });
});
