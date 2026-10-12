/* eslint-disable i18next/no-literal-string */
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { renderHook } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { setHubApiPath } from '../../common/api/formatPath';
import { CollectionVersionSearch } from '../Collection';
import { useDeleteCollectionsFromRepository } from './useDeleteCollectionsFromRepository';

let capturedBulkActionConfig: {
  actionFn?: (collection: CollectionVersionSearch) => Promise<unknown>;
  title?: string;
} = {};

vi.mock('../../common/useHubBulkConfirmation', () => ({
  useHubBulkConfirmation: () => (config: typeof capturedBulkActionConfig) => {
    capturedBulkActionConfig = config;
  },
}));

vi.mock('@ansible/ansible-ui-framework', async () => {
  const actual = await vi.importActual('@ansible/ansible-ui-framework');
  return {
    ...actual,
    usePageNavigate: () => vi.fn(),
  };
});

const mockCollection: CollectionVersionSearch = {
  collection_version: {
    namespace: 'testns',
    name: 'testcol',
    version: '1.0.0',
    pulp_created: '2024-01-01T00:00:00Z',
    pulp_href: '/cv/1/',
    requires_ansible: '>=2.9',
    require_ansible: '>=2.9',
    description: '',
  },
  repository: {
    name: 'published',
    pulp_href: '/repositories/1/',
    latest_version_href: '/repositories/1/versions/1/',
    pulp_id: '1',
    pulp_last_updated: '',
    content_count: 0,
    gpgkey: '',
    description: '',
  },
  repository_version: '1',
  is_signed: false,
  is_deprecated: false,
} as CollectionVersionSearch;

describe('useDeleteCollectionsFromRepository', () => {
  const taskUuid = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';
  let modifyPayload: { remove_content_units?: string[]; base_version?: string } | undefined;
  let taskPollCount = 0;

  const server = setupServer(
    http.get('*/pulp/api/v3/repositories/ansible/ansible/', () =>
      HttpResponse.json({
        results: [
          {
            name: 'published',
            pulp_href: `/pulp/api/v3/repositories/ansible/ansible/${taskUuid}/`,
            latest_version_href: '/versions/1/',
          },
        ],
      })
    ),
    http.get('*/v3/plugin/ansible/search/collection-versions/', () =>
      HttpResponse.json({
        data: [mockCollection],
        links: { next: null },
      })
    ),
    http.post(
      `*/pulp/api/v3/repositories/ansible/ansible/${taskUuid}/modify/`,
      async ({ request }) => {
        modifyPayload = (await request.json()) as {
          remove_content_units?: string[];
          base_version?: string;
        };
        return HttpResponse.json({ task: `/pulp/api/v3/tasks/${taskUuid}/` });
      }
    ),
    http.get(`*/pulp/api/v3/tasks/${taskUuid}/`, () => {
      taskPollCount++;
      return HttpResponse.json({ state: 'completed' });
    })
  );

  beforeAll(() => {
    setHubApiPath('/api/galaxy');
    server.listen({ onUnhandledRequest: 'error' });
  });
  afterEach(() => {
    server.resetHandlers();
    capturedBulkActionConfig = {};
    modifyPayload = undefined;
    taskPollCount = 0;
  });
  afterAll(() => server.close());

  it('configures bulk delete action and removes collection versions from repository', async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <MemoryRouter>{children}</MemoryRouter>
    );

    const { result } = renderHook(() => useDeleteCollectionsFromRepository(), { wrapper });

    result.current([mockCollection]);

    expect(capturedBulkActionConfig.title).toContain('delete');
    expect(capturedBulkActionConfig.actionFn).toBeDefined();

    await capturedBulkActionConfig.actionFn?.(mockCollection);

    expect(modifyPayload).toEqual({
      remove_content_units: [mockCollection.collection_version?.pulp_href],
      base_version: '/versions/1/',
    });
    expect(taskPollCount).toBeGreaterThan(0);
  });
});
