import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { SwrTestWrapper } from '../../../framework/test-utils/swrTestWrapper';
import { useOptions } from './useOptions';

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('useOptions', () => {
  it('should return JSON data from an OPTIONS response', async () => {
    const mockOptions = {
      actions: {
        POST: { name: { type: 'string', required: true } },
        GET: {},
      },
    };

    server.use(http.options('/api/v2/credentials/', () => HttpResponse.json(mockOptions)));

    const { result } = renderHook(() => useOptions<typeof mockOptions>('/api/v2/credentials/'), {
      wrapper: SwrTestWrapper,
    });

    await waitFor(() => {
      expect(result.current.data).toBeDefined();
    });

    expect(result.current.data).toEqual(mockOptions);
    expect(result.current.error).toBeUndefined();
    expect(result.current.isLoading).toBe(false);
  });

  it('should return error on non-ok response', async () => {
    server.use(
      http.options('/api/v2/forbidden/', () =>
        HttpResponse.json({ detail: 'Forbidden' }, { status: 403 })
      )
    );

    const { result } = renderHook(() => useOptions('/api/v2/forbidden/'), {
      wrapper: SwrTestWrapper,
    });

    await waitFor(() => {
      expect(result.current.error).toBeDefined();
    });

    expect(result.current.data).toBeUndefined();
    expect(result.current.isLoading).toBe(false);
  });

  it('should not fetch when url is undefined', () => {
    const { result } = renderHook(() => useOptions(undefined), { wrapper: SwrTestWrapper });

    expect(result.current.data).toBeUndefined();
    expect(result.current.error).toBeUndefined();
  });

  it('should append query parameters to the url', async () => {
    let capturedUrl = '';

    server.use(
      http.options('*', ({ request }) => {
        capturedUrl = new URL(request.url).pathname + new URL(request.url).search;
        return HttpResponse.json({ actions: {} });
      })
    );

    const { result } = renderHook(() => useOptions('/api/v2/credentials/', { page_size: 10 }), {
      wrapper: SwrTestWrapper,
    });

    await waitFor(() => {
      expect(result.current.data).toBeDefined();
    });

    expect(capturedUrl).toContain('page_size=10');
  });

  it('should handle 204 No Content response', async () => {
    server.use(http.options('/api/v2/empty/', () => new HttpResponse(null, { status: 204 })));

    const { result } = renderHook(() => useOptions('/api/v2/empty/'), { wrapper: SwrTestWrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeUndefined();
  });

  it('should handle text/plain response', async () => {
    server.use(
      http.options(
        '/api/v2/text/',
        () =>
          new HttpResponse('plain text response', {
            status: 200,
            headers: { 'Content-Type': 'text/plain' },
          })
      )
    );

    const { result } = renderHook(() => useOptions<string>('/api/v2/text/'), {
      wrapper: SwrTestWrapper,
    });

    await waitFor(() => {
      expect(result.current.data).toBeDefined();
    });

    expect(result.current.data).toBe('plain text response');
  });

  it('should deduplicate concurrent requests to the same url', async () => {
    let requestCount = 0;

    server.use(
      http.options('/api/v2/dedup/', () => {
        requestCount++;
        return HttpResponse.json({ actions: {} });
      })
    );

    const { result: result1 } = renderHook(() => useOptions('/api/v2/dedup/'), {
      wrapper: SwrTestWrapper,
    });
    const { result: result2 } = renderHook(() => useOptions('/api/v2/dedup/'), {
      wrapper: SwrTestWrapper,
    });

    await waitFor(() => {
      expect(result1.current.data).toBeDefined();
      expect(result2.current.data).toBeDefined();
    });

    expect(requestCount).toBe(1);
  });
});
