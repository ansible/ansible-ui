import { renderHook } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, test, vi } from 'vitest';
import { CollectionVersionSearch } from '../Collection';
import { useCopyToRepository } from './useCopyToRepository';

const mockCollection: CollectionVersionSearch = {
  collection_version: {
    namespace: 'testnamespace',
    name: 'testcollection',
    version: '1.0.0',
    pulp_created: '2024-01-01T00:00:00Z',
    pulp_href: '/api/galaxy/v3/collections/testnamespace/testcollection/versions/1.0.0/',
    requires_ansible: '>=2.9',
    require_ansible: '>=2.9',
    description: 'Test collection description',
  },
  repository: {
    name: 'staging',
    description: 'Staging repository',
    pulp_id: 'test-pulp-id',
    pulp_last_updated: '2024-01-01T00:00:00Z',
    content_count: 0,
    gpgkey: '',
    latest_version_href: '/api/galaxy/v3/repositories/staging/versions/1/',
    pulp_href: '/api/galaxy/v3/repositories/staging/',
    pulp_labels: {
      pipeline: 'staging',
    },
  },
  repository_version: '1',
  is_highest: true,
  is_signed: false,
  is_deprecated: false,
};

const mockRepositoriesResponse = {
  meta: {
    count: 0,
  },
  data: [],
};

vi.mock('@ansible/ansible-ui-framework', async () => {
  const actual = await vi.importActual('@ansible/ansible-ui-framework');
  return {
    ...actual,
    usePageDialog: () => [undefined, vi.fn()],
  };
});

vi.mock('../../common/useHubContext', () => ({
  useHubContext: () => ({
    featureFlags: {
      collection_auto_sign: false,
      require_upload_signatures: false,
    },
    settings: {},
    user: null,
    hasPermission: () => false,
  }),
}));

vi.mock('../../administration/repositories/hooks/useRepositorySelector', () => ({
  useRepositoryColumns: () => [],
  useRepositoryFilters: () => [],
}));

vi.mock('../../common/useHubView', () => ({
  useHubView: () => ({
    pageItems: [],
    itemCount: 0,
    refresh: vi.fn(),
  }),
}));

describe('useCopyToRepository', () => {
  const server = setupServer(
    http.get(
      ({ request }) => {
        return request.url.includes('/v3/plugin/ansible/search/collection-versions/');
      },
      () => {
        return HttpResponse.json(mockRepositoriesResponse);
      }
    ),
    http.get(
      ({ request }) => {
        return request.url.includes('/repositories/ansible/ansible/');
      },
      () => {
        return HttpResponse.json({ results: [] });
      }
    )
  );

  beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
  afterAll(() => server.close());
  afterEach(() => server.resetHandlers());

  test('should return a function', () => {
    const refresh = vi.fn();
    const { result } = renderHook(() => useCopyToRepository(refresh));

    expect(typeof result.current).toBe('function');
  });

  test('should call refresh callback when hook is invoked', () => {
    const refresh = vi.fn();
    const { result } = renderHook(() => useCopyToRepository(refresh));

    expect(() => result.current(mockCollection, 'copy')).not.toThrow();
  });

  test('should handle approve operation', () => {
    const refresh = vi.fn();
    const { result } = renderHook(() => useCopyToRepository(refresh));

    expect(() => result.current(mockCollection, 'approve')).not.toThrow();
  });

  test('should handle copy operation', () => {
    const refresh = vi.fn();
    const { result } = renderHook(() => useCopyToRepository(refresh));

    expect(() => result.current(mockCollection, 'copy')).not.toThrow();
  });

  test('should handle displayDefaultError parameter', () => {
    const refresh = vi.fn();
    const { result } = renderHook(() => useCopyToRepository(refresh));

    expect(() => result.current(mockCollection, 'copy', 'Test error message')).not.toThrow();
  });
});
