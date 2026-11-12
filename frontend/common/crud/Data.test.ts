import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import {
  getItemKey,
  postRequest,
  requestDelete,
  requestGet,
  requestPatch,
  requestPut,
  useFetcher,
  usePostFetcher,
} from './Data';

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('Data request helpers', () => {
  it('should GET json response', async () => {
    server.use(http.get('/api/item/', () => HttpResponse.json({ id: 1 })));
    await expect(requestGet<{ id: number }>('/api/item/')).resolves.toEqual({ id: 1 });
  });

  it('should POST json body and parse response', async () => {
    server.use(
      http.post('/api/item/', async ({ request }) => {
        const body = (await request.json()) as { name: string };
        return HttpResponse.json({ id: 2, name: body.name }, { status: 201 });
      })
    );
    await expect(postRequest('/api/item/', { name: 'test' })).resolves.toEqual({
      id: 2,
      name: 'test',
    });
  });

  it('should return null for POST 204 response', async () => {
    server.use(http.post('/api/logout/', () => new HttpResponse(null, { status: 204 })));
    await expect(postRequest('/api/logout/', {})).resolves.toBeNull();
  });

  it('should PUT and PATCH json responses', async () => {
    server.use(
      http.put('/api/item/1/', () => HttpResponse.json({ id: 1, name: 'updated' })),
      http.patch('/api/item/1/', () => HttpResponse.json({ id: 1, name: 'patched' }))
    );
    await expect(requestPut('/api/item/1/', { name: 'updated' })).resolves.toEqual({
      id: 1,
      name: 'updated',
    });
    await expect(requestPatch('/api/item/1/', { name: 'patched' })).resolves.toEqual({
      id: 1,
      name: 'patched',
    });
  });

  it('should return null for DELETE 204 and 202 responses', async () => {
    server.use(
      http.delete('/api/item/1/', () => new HttpResponse(null, { status: 204 })),
      http.delete('/api/item/2/', () => new HttpResponse(null, { status: 202 }))
    );
    const signal = new AbortController().signal;
    await expect(requestDelete('/api/item/1/', signal)).resolves.toBeNull();
    await expect(requestDelete('/api/item/2/', signal)).resolves.toBeNull();
  });

  it('should throw RequestError for failed response', async () => {
    server.use(
      http.get('/api/error/', () => HttpResponse.json({ detail: 'fail' }, { status: 500 }))
    );
    await expect(requestGet('/api/error/')).rejects.toThrow();
  });

  it('should expose fetcher hooks and item key helper', () => {
    expect(useFetcher()).toBe(requestGet);
    expect(usePostFetcher()).toBe(postRequest);
    expect(getItemKey({ id: 7 })).toBe('7');
  });
});
