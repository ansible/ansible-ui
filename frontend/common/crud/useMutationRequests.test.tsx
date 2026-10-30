import { renderHook } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { SwrTestWrapper } from '../../../framework/test-utils/swrTestWrapper';
import { useDeleteRequest } from './useDeleteRequest';
import { usePatchRequest } from './usePatchRequest';
import { usePostRequest } from './usePostRequest';
import { usePutRequest } from './usePutRequest';

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('usePostRequest', () => {
  it('should POST json and return parsed body', async () => {
    server.use(
      http.post('/api/create/', async ({ request }) => {
        const body = (await request.json()) as { name: string };
        return HttpResponse.json({ id: 1, ...body });
      })
    );

    const { result } = renderHook(
      () => usePostRequest<{ name: string }, { id: number; name: string }>(),
      {
        wrapper: SwrTestWrapper,
      }
    );

    await expect(result.current('/api/create/', { name: 'demo' })).resolves.toEqual({
      id: 1,
      name: 'demo',
    });
  });

  it('should return null for 204 response', async () => {
    server.use(http.post('/api/empty/', () => new HttpResponse(null, { status: 204 })));
    const { result } = renderHook(() => usePostRequest(), { wrapper: SwrTestWrapper });
    await expect(result.current('/api/empty/', {})).resolves.toBeNull();
  });

  it('should throw on error response', async () => {
    server.use(http.post('/api/error/', () => HttpResponse.json({}, { status: 400 })));
    const { result } = renderHook(() => usePostRequest(), { wrapper: SwrTestWrapper });
    await expect(result.current('/api/error/', {})).rejects.toThrow();
  });
});

describe('usePutRequest', () => {
  it('should PUT json and return text/plain body', async () => {
    server.use(
      http.put(
        '/api/update/',
        () => new HttpResponse('updated', { headers: { 'Content-Type': 'text/plain' } })
      )
    );
    const { result } = renderHook(() => usePutRequest(), { wrapper: SwrTestWrapper });
    await expect(result.current('/api/update/', { name: 'x' })).resolves.toBe('updated');
  });
});

describe('usePatchRequest', () => {
  it('should PATCH json and return blob body', async () => {
    server.use(
      http.patch(
        '/api/patch/',
        () =>
          new HttpResponse(new Blob(['patch']), {
            headers: { 'Content-Type': 'application/octet-stream' },
          })
      )
    );
    const { result } = renderHook(() => usePatchRequest(), { wrapper: SwrTestWrapper });
    const response = await result.current('/api/patch/', { enabled: true });
    expect(response).toBeInstanceOf(Blob);
  });
});

describe('useDeleteRequest', () => {
  it('should DELETE and return json body', async () => {
    server.use(http.delete('/api/delete/1/', () => HttpResponse.json({ deleted: true })));
    const { result } = renderHook(() => useDeleteRequest(), { wrapper: SwrTestWrapper });
    await expect(result.current('/api/delete/1/')).resolves.toEqual({ deleted: true });
  });

  it('should return null for 204 DELETE', async () => {
    server.use(http.delete('/api/delete/2/', () => new HttpResponse(null, { status: 204 })));
    const { result } = renderHook(() => useDeleteRequest(), { wrapper: SwrTestWrapper });
    await expect(result.current('/api/delete/2/')).resolves.toBeNull();
  });

  it('should POST and parse application/json responses', async () => {
    server.use(http.post('/api/json/', () => HttpResponse.json({ ok: true })));
    const { result } = renderHook(() => usePostRequest(), { wrapper: SwrTestWrapper });
    await expect(result.current('/api/json/', {})).resolves.toEqual({ ok: true });
  });

  it('should PUT and parse application/json responses', async () => {
    server.use(http.put('/api/json/', () => HttpResponse.json({ updated: true })));
    const { result } = renderHook(() => usePutRequest(), { wrapper: SwrTestWrapper });
    await expect(result.current('/api/json/', {})).resolves.toEqual({ updated: true });
  });
});
