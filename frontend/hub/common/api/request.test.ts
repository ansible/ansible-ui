/* eslint-disable i18next/no-literal-string */
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { setHubApiPath } from './formatPath';
import {
  deleteHubRequest,
  getHubAllItems,
  getHubRequest,
  hubPostRequestFile,
  patchHubRequest,
  postHubRequest,
  putHubRequest,
} from './request';

const server = setupServer();

beforeAll(() => {
  setHubApiPath('/api/galaxy');
  document.cookie = 'csrftoken=test-csrf';
  server.listen({ onUnhandledRequest: 'error' });
});
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('hub request helpers', () => {
  it('getHubRequest returns JSON body for 200 responses', async () => {
    server.use(http.get('*/api/test/', () => HttpResponse.json({ value: 1 })));

    const { statusCode, response } = await getHubRequest<{ value: number }>('/api/test/');
    expect(statusCode).toBe(200);
    expect(response).toEqual({ value: 1 });
  });

  it('postHubRequest returns task body for 202 responses', async () => {
    server.use(
      http.post('*/api/task/', () =>
        HttpResponse.json({ task: '/pulp/api/v3/tasks/abc/' }, { status: 202 })
      )
    );

    const { statusCode, response } = await postHubRequest('/api/task/', { a: 1 });
    expect(statusCode).toBe(202);
    expect(response).toEqual({ task: '/pulp/api/v3/tasks/abc/' });
  });

  it('putHubRequest and patchHubRequest return null for 204 responses', async () => {
    server.use(
      http.put('*/api/empty/', () => new HttpResponse(null, { status: 204 })),
      http.patch('*/api/empty/', () => new HttpResponse(null, { status: 204 }))
    );

    const putResult = await putHubRequest('/api/empty/', {});
    const patchResult = await patchHubRequest('/api/empty/', {});
    expect(putResult.statusCode).toBe(204);
    expect(putResult.response).toBeNull();
    expect(patchResult.statusCode).toBe(204);
    expect(patchResult.response).toBeNull();
  });

  it('deleteHubRequest propagates errors for failed responses', async () => {
    server.use(
      http.delete('*/api/missing/', () => HttpResponse.json({ detail: 'nope' }, { status: 404 }))
    );

    await expect(deleteHubRequest('/api/missing/')).rejects.toBeTruthy();
  });

  it('hubPostRequestFile uploads multipart data and parses 202 tasks', async () => {
    const taskUuid = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
    server.use(
      http.post('*/api/upload/', () =>
        HttpResponse.json({ task: `/pulp/api/v3/tasks/${taskUuid}/` }, { status: 202 })
      ),
      http.get(`*/pulp/api/v3/tasks/${taskUuid}/`, () => HttpResponse.json({ state: 'completed' }))
    );

    const file = new Blob(['tar'], { type: 'application/gzip' });
    const result = await hubPostRequestFile('/api/upload/', file, 'repo', 'signed');
    expect(result).toMatchObject({ state: 'completed' });
  });

  it('getHubAllItems paginates until next link is empty', async () => {
    server.use(
      http.get('*/start/', () =>
        HttpResponse.json({ results: [{ id: 1 }], next: 'http://localhost/page-2/' })
      ),
      http.get('*/page-2/', () => HttpResponse.json({ results: [{ id: 2 }], next: null }))
    );

    const { results, loadedAll } = await getHubAllItems<
      { results: { id: number }[]; next?: string | null },
      { id: number }
    >('/start/', {
      getData: (res) => res.results,
      getNextUrl: (res) => res.next ?? undefined,
    });

    expect(results).toEqual([{ id: 1 }, { id: 2 }]);
    expect(loadedAll).toBe(true);
  });
});
