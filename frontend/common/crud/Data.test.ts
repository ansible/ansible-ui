import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest';
import {
  getItemKey,
  postRequest,
  requestDelete,
  requestGet,
  requestPatch,
  requestPut,
  swrOptions,
} from './Data';

interface TestItem {
  id: number;
  name: string;
}

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('swrOptions', () => {
  test('should not override dedupingInterval so PageSettingsProvider controls it', () => {
    expect(swrOptions.dedupingInterval).toBeUndefined();
  });
});

describe('requestGet', () => {
  test('should return parsed JSON on success', async () => {
    server.use(
      http.get('/api/test/', () => {
        return HttpResponse.json({ id: 1, name: 'item' });
      })
    );

    const result = await requestGet<TestItem>('/api/test/');
    expect(result).toEqual({ id: 1, name: 'item' });
  });

  test('should throw on non-OK response', async () => {
    server.use(
      http.get('/api/get-fail/', () => {
        return HttpResponse.json({ detail: 'Not found' }, { status: 404 });
      })
    );

    await expect(requestGet('/api/get-fail/')).rejects.toThrow();
  });
});

describe('postRequest', () => {
  test('should send JSON body and return parsed response', async () => {
    server.use(
      http.post('/api/items/', async ({ request }) => {
        const body = (await request.json()) as { name: string };
        return HttpResponse.json({ id: 99, name: body.name }, { status: 201 });
      })
    );

    const result = await postRequest<TestItem>('/api/items/', { name: 'new-item' });
    expect(result).toEqual({ id: 99, name: 'new-item' });
  });

  test('should return null for 204 responses', async () => {
    server.use(
      http.post('/api/logout/', () => {
        return new HttpResponse(null, { status: 204 });
      })
    );

    const result = await postRequest('/api/logout/', {});
    expect(result).toBeNull();
  });

  test('should throw on non-OK response', async () => {
    server.use(
      http.post('/api/post-fail/', () => {
        return HttpResponse.json({ detail: 'Bad request' }, { status: 400 });
      })
    );

    await expect(postRequest('/api/post-fail/', {})).rejects.toThrow();
  });
});

describe('requestPut', () => {
  test('should send JSON body and return parsed response', async () => {
    server.use(
      http.put('/api/items/1/', async ({ request }) => {
        const body = (await request.json()) as { name: string };
        return HttpResponse.json({ id: 1, name: body.name });
      })
    );

    const result = await requestPut<TestItem>('/api/items/1/', { name: 'updated' });
    expect(result).toEqual({ id: 1, name: 'updated' });
  });

  test('should throw on non-OK response', async () => {
    server.use(
      http.put('/api/put-fail/', () => {
        return HttpResponse.json({ detail: 'Forbidden' }, { status: 403 });
      })
    );

    await expect(requestPut('/api/put-fail/', {})).rejects.toThrow();
  });
});

describe('requestPatch', () => {
  test('should send partial JSON body and return parsed response', async () => {
    server.use(
      http.patch('/api/items/1/', async ({ request }) => {
        const body = (await request.json()) as { name: string };
        return HttpResponse.json({ id: 1, name: body.name });
      })
    );

    const result = await requestPatch<TestItem>('/api/items/1/', { name: 'patched' });
    expect(result).toEqual({ id: 1, name: 'patched' });
  });

  test('should throw on non-OK response', async () => {
    server.use(
      http.patch('/api/patch-fail/', () => {
        return HttpResponse.json({ detail: 'Conflict' }, { status: 409 });
      })
    );

    await expect(requestPatch('/api/patch-fail/', {})).rejects.toThrow();
  });
});

describe('requestDelete', () => {
  test('should return null for 204 response', async () => {
    server.use(
      http.delete('/api/items/1/', () => {
        return new HttpResponse(null, { status: 204 });
      })
    );

    const controller = new AbortController();
    const result = await requestDelete('/api/items/1/', controller.signal);
    expect(result).toBeNull();
  });

  test('should return null for 202 response', async () => {
    server.use(
      http.delete('/api/items/2/', () => {
        return new HttpResponse(null, { status: 202 });
      })
    );

    const controller = new AbortController();
    const result = await requestDelete('/api/items/2/', controller.signal);
    expect(result).toBeNull();
  });

  test('should return parsed JSON for 200 response', async () => {
    server.use(
      http.delete('/api/items/3/', () => {
        return HttpResponse.json({ id: 3, name: 'deleted' });
      })
    );

    const controller = new AbortController();
    const result = await requestDelete<TestItem>('/api/items/3/', controller.signal);
    expect(result).toEqual({ id: 3, name: 'deleted' });
  });

  test('should throw on non-OK response', async () => {
    server.use(
      http.delete('/api/delete-fail/', () => {
        return HttpResponse.json({ detail: 'Not found' }, { status: 404 });
      })
    );

    const controller = new AbortController();
    await expect(requestDelete('/api/delete-fail/', controller.signal)).rejects.toThrow();
  });
});

describe('getItemKey', () => {
  test('should return numeric id as string', () => {
    expect(getItemKey({ id: 42 })).toBe('42');
  });

  test('should return string id as-is', () => {
    expect(getItemKey({ id: 'abc-123' })).toBe('abc-123');
  });
});
