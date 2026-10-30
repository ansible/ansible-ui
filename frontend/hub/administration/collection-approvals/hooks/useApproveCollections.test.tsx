/* eslint-disable i18next/no-literal-string */
import { act, renderHook } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CollectionVersionSearch } from '../Approval';
import { useApproveCollectionsFrameworkModal } from './useApproveCollections';

let capturedConfig: {
  title?: string;
  confirmText?: string;
  actionButtonText?: string;
  actionFn?: (collection: CollectionVersionSearch) => Promise<unknown>;
} = {};

vi.mock('../../../common/useHubBulkConfirmation', () => ({
  useHubBulkConfirmation: () => (config: typeof capturedConfig) => {
    capturedConfig = config;
  },
}));

vi.mock('./useApprovalsColumns', () => ({
  useApprovalsColumns: () => [{ header: 'Collection' }],
}));

vi.mock('../../../collections/hooks/useCopyToRepository', () => ({
  copyToRepositoryAction: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@ansible/common-ui/crud/Data', () => ({
  requestGet: vi.fn().mockResolvedValue({
    results: [{ pulp_href: '/pulp/api/v3/repositories/ansible/ansible/approved/' }],
  }),
}));

const mockFeatureFlags = {
  collection_auto_sign: false,
  require_upload_signatures: false,
};

vi.mock('../../../common/useHubContext', () => ({
  useHubContext: () => ({
    featureFlags: mockFeatureFlags,
    settings: {},
    user: null,
    hasPermission: () => false,
  }),
}));

import { copyToRepositoryAction } from '../../../collections/hooks/useCopyToRepository';
import { requestGet } from '@ansible/common-ui/crud/Data';

const mockCollection: CollectionVersionSearch = {
  collection_version: {
    namespace: 'demo',
    name: 'collection',
    version: '1.0.0',
    pulp_created: '2024-01-01T00:00:00Z',
    pulp_href: '/pulp/cv/1/',
    requires_ansible: '>=2.9',
    require_ansible: '>=2.9',
    description: '',
  },
  repository: {
    name: 'staging',
    pulp_href: '/pulp/repo/1/',
    description: '',
    pulp_id: '1',
    pulp_last_updated: '',
    content_count: 0,
    gpgkey: '',
    latest_version_href: '',
    pulp_labels: { pipeline: 'staging' },
  },
  repository_version: '1',
  is_highest: true,
  is_signed: false,
  is_deprecated: false,
};

describe('useApproveCollectionsFrameworkModal', () => {
  beforeEach(() => {
    capturedConfig = {};
    vi.mocked(copyToRepositoryAction).mockClear();
    mockFeatureFlags.collection_auto_sign = false;
    mockFeatureFlags.require_upload_signatures = false;
  });

  it('opens approve collections bulk confirmation', () => {
    const { result } = renderHook(() => useApproveCollectionsFrameworkModal(vi.fn()), {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    });

    act(() => {
      result.current([mockCollection]);
    });

    expect(capturedConfig.title).toBe('Approve collections');
    expect(capturedConfig.actionButtonText).toBe('Approve collections');
  });

  it('uses approve and sign copy when auto sign is enabled', () => {
    mockFeatureFlags.collection_auto_sign = true;
    const { result } = renderHook(() => useApproveCollectionsFrameworkModal(vi.fn()), {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    });

    act(() => {
      result.current([mockCollection]);
    });

    expect(capturedConfig.title).toBe('Approve and sign collections');
  });

  it('runs approve actionFn via bulk confirmation', async () => {
    const { result } = renderHook(() => useApproveCollectionsFrameworkModal(vi.fn()), {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    });

    act(() => {
      result.current([mockCollection]);
    });

    await act(async () => {
      await capturedConfig.actionFn?.(mockCollection);
    });

    expect(requestGet).toHaveBeenCalled();
    expect(copyToRepositoryAction).toHaveBeenCalled();
  });
});
