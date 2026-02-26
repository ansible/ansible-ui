/* eslint-disable i18next/no-literal-string */
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { renderHook, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { useDeprecateOrUndeprecateCollections } from './useDeprecateOrUndeprecateCollections';
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
    },
    settings: {},
    user: null,
    hasPermission: () => false,
  }),
}));

// Track requestPatch calls via MSW
const patchRequests: { url: string; body: unknown }[] = [];

// Capture the config passed to bulkAction
let capturedBulkActionConfig: {
  actionFn?: (collection: CollectionVersionSearch) => Promise<unknown>;
  title?: string;
  confirmText?: string;
  actionButtonText?: string;
} = {};

vi.mock('../../common/useHubBulkConfirmation', () => ({
  useHubBulkConfirmation: () => (config: typeof capturedBulkActionConfig) => {
    capturedBulkActionConfig = config;
  },
}));

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

function renderUseDeprecateOrUndeprecate() {
  const onComplete = vi.fn();
  return renderHook(() => useDeprecateOrUndeprecateCollections(onComplete), {
    wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
  });
}

describe('useDeprecateOrUndeprecateCollections', () => {
  const server = setupServer(
    // Platform mode: distribution lookup by repository pulp_href
    http.get(
      ({ request }) => request.url.includes('/distributions/ansible/ansible/'),
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
    ),
    // Mock PATCH for deprecate/undeprecate
    http.patch('*/v3/plugin/ansible/content/*/collections/index/*/*/', async ({ request }) => {
      const body = await request.json();
      patchRequests.push({ url: request.url, body });
      return HttpResponse.json({ deprecated: (body as { deprecated: boolean }).deprecated });
    })
  );

  beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
  afterEach(() => {
    server.resetHandlers();
    vi.clearAllMocks();
    capturedBulkActionConfig = {};
    patchRequests.length = 0;
  });
  afterAll(() => server.close());

  it('should return a callback function', () => {
    const { result } = renderUseDeprecateOrUndeprecate();
    expect(typeof result.current).toBe('function');
  });

  it('should set correct title for deprecate action', () => {
    const { result } = renderUseDeprecateOrUndeprecate();
    result.current([mockCollection], 'deprecate');
    expect(capturedBulkActionConfig.title).toBe('Permanently deprecate collections');
  });

  it('should set correct title for undeprecate action', () => {
    const { result } = renderUseDeprecateOrUndeprecate();
    result.current([mockCollection], 'undeprecate');
    expect(capturedBulkActionConfig.title).toBe('Permanently undeprecate collections');
  });

  it('should set correct button text for deprecate', () => {
    const { result } = renderUseDeprecateOrUndeprecate();
    result.current([mockCollection], 'deprecate');
    expect(capturedBulkActionConfig.actionButtonText).toBe('Deprecate collections');
  });

  it('should set correct button text for undeprecate', () => {
    const { result } = renderUseDeprecateOrUndeprecate();
    result.current([mockCollection], 'undeprecate');
    expect(capturedBulkActionConfig.actionButtonText).toBe('Undeprecate collections');
  });

  describe('actionFn in platform mode', () => {
    beforeEach(() => {
      vi.mocked(isInsightsMode).mockReturnValue(false);
    });

    it('should call distribution API and PATCH to deprecate', async () => {
      const { result } = renderUseDeprecateOrUndeprecate();
      result.current([mockCollection], 'deprecate');

      expect(capturedBulkActionConfig.actionFn).toBeDefined();
      await capturedBulkActionConfig.actionFn!(mockCollection);

      await waitFor(() => {
        expect(patchRequests.length).toBeGreaterThan(0);
        const lastPatch = patchRequests[patchRequests.length - 1];
        expect(lastPatch.url).toContain(
          '/v3/plugin/ansible/content/published/collections/index/testns/testcol/'
        );
        expect(lastPatch.body).toEqual({ deprecated: true });
      });
    });

    it('should PATCH to undeprecate', async () => {
      const { result } = renderUseDeprecateOrUndeprecate();
      result.current([mockCollection], 'undeprecate');

      await capturedBulkActionConfig.actionFn!(mockCollection);

      await waitFor(() => {
        expect(patchRequests.length).toBeGreaterThan(0);
        const lastPatch = patchRequests[patchRequests.length - 1];
        expect(lastPatch.body).toEqual({ deprecated: false });
      });
    });
  });

  describe('actionFn in insights mode', () => {
    beforeEach(() => {
      vi.mocked(isInsightsMode).mockReturnValue(true);
    });

    it('should use getRepositoryBasePath and PATCH to deprecate', async () => {
      const { result } = renderUseDeprecateOrUndeprecate();
      result.current([mockCollection], 'deprecate');

      expect(capturedBulkActionConfig.actionFn).toBeDefined();
      await capturedBulkActionConfig.actionFn!(mockCollection);

      await waitFor(() => {
        expect(patchRequests.length).toBeGreaterThan(0);
        const lastPatch = patchRequests[patchRequests.length - 1];
        expect(lastPatch.url).toContain(
          '/v3/plugin/ansible/content/published/collections/index/testns/testcol/'
        );
        expect(lastPatch.body).toEqual({ deprecated: true });
      });
    });

    it('should use getRepositoryBasePath and PATCH to undeprecate', async () => {
      const { result } = renderUseDeprecateOrUndeprecate();
      result.current([mockCollection], 'undeprecate');

      await capturedBulkActionConfig.actionFn!(mockCollection);

      await waitFor(() => {
        expect(patchRequests.length).toBeGreaterThan(0);
        const lastPatch = patchRequests[patchRequests.length - 1];
        expect(lastPatch.body).toEqual({ deprecated: false });
      });
    });
  });
});
