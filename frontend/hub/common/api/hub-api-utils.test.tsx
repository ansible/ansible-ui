/* eslint-disable i18next/no-literal-string */
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { renderHook, waitFor } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { setHubApiPath } from './formatPath';
import {
  appendTrailingSlash,
  collectionKeyFn,
  getRepositoryBasePath,
  getRepoURL,
  hubAPIDelete,
  hubAPIPatch,
  hubAPIPost,
  hubAPIPut,
  parsePulpIDFromURL,
  parseTaskResponse,
  pulpHrefKeyFn,
  pulpIdKeyFn,
  serverlessURL,
  useRepositoryBasePath,
  waitForTask,
} from './hub-api-utils';

const pulpUuid = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';

const server = setupServer();

beforeAll(() => {
  setHubApiPath('/api/galaxy');
  server.listen({ onUnhandledRequest: 'error' });
});
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('hub-api-utils', () => {
  describe('utility helpers', () => {
    it('parsePulpIDFromURL extracts UUID segments', () => {
      expect(parsePulpIDFromURL(`/pulp/api/v3/tasks/${pulpUuid}/`)).toBe(pulpUuid);
      expect(parsePulpIDFromURL(null)).toBeNull();
    });

    it('serverlessURL strips host from absolute pulp links', () => {
      expect(serverlessURL('/api/foo')).toBe('/api/foo');
      expect(serverlessURL('http://localhost:5001/api/foo?x=1#hash')).toBe('/api/foo?x=1#hash');
      expect(serverlessURL()).toBeUndefined();
    });

    it('key functions and appendTrailingSlash', () => {
      expect(pulpIdKeyFn({ pulp_id: '1' })).toBe('1');
      expect(pulpHrefKeyFn({ pulp_href: '/href/' })).toBe('/href/');
      expect(
        collectionKeyFn({
          collection_version: { pulp_href: '/cv/', version: '1.0.0' },
          repository: { name: 'published' },
        })
      ).toBe('/cv/_published_1.0.0');
      expect(appendTrailingSlash('/api')).toBe('/api/');
      expect(appendTrailingSlash('/api/')).toBe('/api/');
    });

    it('getRepoURL handles published and custom base paths', () => {
      vi.stubEnv('HUB_API_PREFIX', '/api/galaxy/pulp/api/v3');
      const origin = window.location.origin;
      expect(getRepoURL('published')).toBe(`${origin}/api/galaxy/pulp/api/v3/`);
      expect(getRepoURL('community', true)).toBe(
        `${origin}/api/galaxy/pulp/api/v3/content/community/`
      );
      vi.unstubAllEnvs();
    });
  });

  describe('getRepositoryBasePath', () => {
    it('returns matching distribution base path when repository matches', async () => {
      server.use(
        http.get('*/pulp/api/v3/distributions/ansible/ansible/', ({ request }) => {
          const url = new URL(request.url);
          if (url.searchParams.get('name') === 'repo-a') {
            return HttpResponse.json({
              results: [{ base_path: 'repo-a', repository: '/repositories/1/' }],
            });
          }
          return HttpResponse.json({ results: [] });
        })
      );

      const basePath = await getRepositoryBasePath(
        'repo-a',
        '/repositories/1/',
        ((key: string) => key) as Parameters<typeof getRepositoryBasePath>[2]
      );
      expect(basePath).toBe('repo-a');
    });

    it('loads repository by name when pulp_href is empty', async () => {
      server.use(
        http.get('*/pulp/api/v3/repositories/ansible/ansible/', () =>
          HttpResponse.json({
            results: [{ name: 'repo-c', pulp_href: '/repositories/3/' }],
          })
        ),
        http.get('*/pulp/api/v3/distributions/ansible/ansible/', ({ request }) => {
          const url = new URL(request.url);
          if (url.searchParams.get('name') === 'repo-c') {
            return HttpResponse.json({
              results: [{ base_path: 'from-name', repository: '/repositories/3/' }],
            });
          }
          return HttpResponse.json({ results: [] });
        })
      );

      const basePath = await getRepositoryBasePath(
        'repo-c',
        '',
        ((key: string) => key) as Parameters<typeof getRepositoryBasePath>[2]
      );
      expect(basePath).toBe('from-name');
    });
  });

  describe('useRepositoryBasePath', () => {
    it('exposes base path from getRepositoryBasePath', async () => {
      server.use(
        http.get('*/pulp/api/v3/distributions/ansible/ansible/', () =>
          HttpResponse.json({
            results: [{ base_path: 'hook-path', repository: '/repositories/9/' }],
          })
        )
      );

      const { result } = renderHook(() => useRepositoryBasePath('hook-repo', '/repositories/9/'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      expect(result.current.basePath).toBe('hook-path');
    });
  });

  describe('waitForTask and parseTaskResponse', () => {
    it('waits until task completes successfully', async () => {
      let polls = 0;
      server.use(
        http.get(`*/pulp/api/v3/tasks/${pulpUuid}/`, () => {
          polls++;
          if (polls < 2) {
            return HttpResponse.json({ state: 'running' });
          }
          return HttpResponse.json({ state: 'completed' });
        })
      );

      const result = await waitForTask(pulpUuid, undefined, 10, 1, 5);
      expect(result).toMatchObject({ state: 'completed' });
    });

    it('throws when task fails with description', async () => {
      server.use(
        http.get(`*/pulp/api/v3/tasks/${pulpUuid}/`, () =>
          HttpResponse.json({ state: 'failed', error: { description: 'Task blew up' } })
        )
      );

      await expect(waitForTask(pulpUuid, undefined, 10, 1, 3)).rejects.toThrow('Task blew up');
    });

    it('parseTaskResponse polls task href from response', async () => {
      server.use(
        http.get(`*/pulp/api/v3/tasks/${pulpUuid}/`, () =>
          HttpResponse.json({ state: 'completed' })
        )
      );

      const task = await parseTaskResponse({ task: `/pulp/api/v3/tasks/${pulpUuid}/` });
      expect(task).toMatchObject({ state: 'completed' });
    });
  });

  describe('hub API wrappers', () => {
    it('hubAPIPost returns body for non-202 responses', async () => {
      server.use(
        http.post('*/pulp/api/v3/foo/', () => HttpResponse.json({ ok: true }, { status: 201 }))
      );

      const response = await hubAPIPost<{ ok: boolean }>('/api/galaxy/pulp/api/v3/foo/', {});
      expect(response).toEqual({ ok: true });
    });

    it('hubAPIPost waits for task on 202 responses', async () => {
      server.use(
        http.post('*/pulp/api/v3/foo/', () =>
          HttpResponse.json({ task: `/pulp/api/v3/tasks/${pulpUuid}/` }, { status: 202 })
        ),
        http.get(`*/pulp/api/v3/tasks/${pulpUuid}/`, () =>
          HttpResponse.json({ state: 'completed' })
        )
      );

      const response = await hubAPIPost('/api/galaxy/pulp/api/v3/foo/', {});
      expect(response).toMatchObject({ state: 'completed' });
    });

    it('hubAPIDelete, hubAPIPatch, and hubAPIPut handle 202 task responses', async () => {
      server.use(
        http.delete('*/pulp/api/v3/item/', () =>
          HttpResponse.json({ task: `/pulp/api/v3/tasks/${pulpUuid}/` }, { status: 202 })
        ),
        http.patch('*/pulp/api/v3/item/', () =>
          HttpResponse.json({ task: `/pulp/api/v3/tasks/${pulpUuid}/` }, { status: 202 })
        ),
        http.put('*/pulp/api/v3/item/', () =>
          HttpResponse.json({ task: `/pulp/api/v3/tasks/${pulpUuid}/` }, { status: 202 })
        ),
        http.get(`*/pulp/api/v3/tasks/${pulpUuid}/`, () =>
          HttpResponse.json({ state: 'completed' })
        )
      );

      await expect(hubAPIDelete('/api/galaxy/pulp/api/v3/item/')).resolves.toBeUndefined();
      await expect(hubAPIPatch('/api/galaxy/pulp/api/v3/item/', { x: 1 })).resolves.toBeUndefined();
      await expect(hubAPIPut('/api/galaxy/pulp/api/v3/item/', { x: 1 })).resolves.toBeUndefined();
    });
  });
});
