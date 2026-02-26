/* eslint-disable i18next/no-literal-string */
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { renderHook, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { useDeleteCollections } from './useDeleteCollections';
import { CollectionVersionSearch } from '../Collection';

// Mock isInsightsMode
vi.mock('../../common/isInsights', () => ({
  isInsightsMode: vi.fn(() => false),
  filterInsightsBulkActions: vi.fn((actions: unknown[]) => actions),
}));

import { isInsightsMode } from '../../common/isInsights';

// Mock useHubContext
vi.mock('../../common/useHubContext', () => ({
  useHubContext: () => ({
    featureFlags: {
      display_signatures: false,
      can_upload_signatures: false,
      require_upload_signatures: false,
      collection_auto_sign: false,
    },
    settings: {},
    user: null,
    hasPermission: () => false,
  }),
}));

// Capture the config passed to bulkAction
let capturedBulkActionConfig: {
  actionFn?: (collection: CollectionVersionSearch, signal: AbortSignal) => Promise<unknown>;
  title?: string;
  confirmText?: string;
  actionButtonText?: string;
} = {};

vi.mock('../../common/useHubBulkConfirmation', () => ({
  useHubBulkConfirmation: () => (config: typeof capturedBulkActionConfig) => {
    capturedBulkActionConfig = config;
  },
}));

vi.mock('../../common/api/hub-api-utils', async () => {
  const actual = await vi.importActual('../../common/api/hub-api-utils');
  return {
    ...actual,
    hubAPIDelete: vi.fn().mockResolvedValue(undefined),
    // In insights mode, getRepositoryBasePath is used to find the distribution base path
    getRepositoryBasePath: vi.fn().mockResolvedValue('published'),
  };
});

import { hubAPIDelete } from '../../common/api/hub-api-utils';

const mockCollection: CollectionVersionSearch = {
  collection_version: {
    namespace: 'testns',
    name: 'testcol',
    version: '1.0.0',
    pulp_created: '2024-01-01T00:00:00Z',
    pulp_href: '/pulp/api/v3/content/ansible/collection_versions/1/',
    requires_ansible: '>=2.9',
    require_ansible: '>=2.9',
    description: 'Test collection',
  },
  repository: {
    name: 'published',
    pulp_href: '/pulp/api/v3/repositories/ansible/ansible/1/',
    description: '',
    pulp_id: '1',
    pulp_last_updated: '',
    content_count: 0,
    gpgkey: '',
    latest_version_href: '',
  },
  repository_version: '1',
  is_highest: true,
  is_signed: false,
  is_deprecated: false,
};

function renderUseDeleteCollections(version?: boolean, detail?: boolean) {
  const onComplete = vi.fn();
  return renderHook(() => useDeleteCollections(onComplete, version, detail), {
    wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
  });
}

describe('useDeleteCollections', () => {
  const server = setupServer(
    // Platform mode: distribution lookup
    http.get(
      ({ request }) => request.url.includes('/distributions/ansible/ansible/'),
      () =>
        HttpResponse.json({
          count: 1,
          results: [{ base_path: 'published', name: 'published' }],
        })
    ),
    // Insights mode: getRepositoryBasePath looks up distribution by name
    http.get(
      ({ request }) =>
        request.url.includes('/distributions/ansible/ansible/') &&
        request.url.includes('name=published'),
      () =>
        HttpResponse.json({
          count: 1,
          results: [
            {
              base_path: 'published',
              name: 'published',
              repository: '/pulp/api/v3/repositories/ansible/ansible/1/',
            },
          ],
        })
    )
  );

  beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
  afterEach(() => {
    server.resetHandlers();
    vi.clearAllMocks();
    capturedBulkActionConfig = {};
  });
  afterAll(() => server.close());

  it('should return a callback function', () => {
    const { result } = renderUseDeleteCollections();
    expect(typeof result.current).toBe('function');
  });

  it('should set correct title for collection deletion', () => {
    const { result } = renderUseDeleteCollections(false);
    result.current([mockCollection]);
    expect(capturedBulkActionConfig.title).toBe('Permanently delete collections');
  });

  it('should set correct title for version deletion', () => {
    const { result } = renderUseDeleteCollections(true);
    result.current([mockCollection]);
    expect(capturedBulkActionConfig.title).toBe('Permanently delete collections versions');
  });

  it('should set correct button text for collection deletion', () => {
    const { result } = renderUseDeleteCollections(false);
    result.current([mockCollection]);
    expect(capturedBulkActionConfig.actionButtonText).toBe('Delete collections');
  });

  it('should set correct button text for version deletion', () => {
    const { result } = renderUseDeleteCollections(true);
    result.current([mockCollection]);
    expect(capturedBulkActionConfig.actionButtonText).toBe('Delete collections versions');
  });

  describe('actionFn in platform mode', () => {
    beforeEach(() => {
      vi.mocked(isInsightsMode).mockReturnValue(false);
    });

    it('should call distribution API and hubAPIDelete with correct path', async () => {
      const { result } = renderUseDeleteCollections(false);
      result.current([mockCollection]);

      expect(capturedBulkActionConfig.actionFn).toBeDefined();

      const controller = new AbortController();
      await capturedBulkActionConfig.actionFn!(mockCollection, controller.signal);

      await waitFor(() => {
        expect(hubAPIDelete).toHaveBeenCalledWith(
          expect.stringContaining(
            '/v3/plugin/ansible/content/published/collections/index/testns/testcol/'
          ),
          controller.signal
        );
      });
    });

    it('should append version query when deleting a version', async () => {
      const { result } = renderUseDeleteCollections(true);
      result.current([mockCollection]);

      const controller = new AbortController();
      await capturedBulkActionConfig.actionFn!(mockCollection, controller.signal);

      await waitFor(() => {
        expect(hubAPIDelete).toHaveBeenCalledWith(
          expect.stringContaining('versions/1.0.0'),
          controller.signal
        );
      });
    });
  });

  describe('actionFn in insights mode', () => {
    beforeEach(() => {
      vi.mocked(isInsightsMode).mockReturnValue(true);
    });

    it('should use getRepositoryBasePath and call hubAPIDelete with correct path', async () => {
      const { result } = renderUseDeleteCollections(false);
      result.current([mockCollection]);

      expect(capturedBulkActionConfig.actionFn).toBeDefined();

      const controller = new AbortController();
      await capturedBulkActionConfig.actionFn!(mockCollection, controller.signal);

      await waitFor(() => {
        expect(hubAPIDelete).toHaveBeenCalledWith(
          expect.stringContaining(
            '/v3/plugin/ansible/content/published/collections/index/testns/testcol/'
          ),
          controller.signal
        );
      });
    });
  });
});
