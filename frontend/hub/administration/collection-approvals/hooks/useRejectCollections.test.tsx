/* eslint-disable i18next/no-literal-string */
import { act, renderHook } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CollectionVersionSearch } from '../Approval';
import { useRejectCollections } from './useRejectCollections';

let capturedConfig: {
  title?: string;
  isDanger?: boolean;
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

vi.mock('@ansible/common-ui/crud/Data', () => ({
  requestGet: vi.fn().mockResolvedValue({
    results: [{ pulp_href: '/pulp/api/v3/repositories/ansible/ansible/rejected/' }],
  }),
}));

vi.mock('../../../common/api/hub-api-utils', async () => {
  const actual = await vi.importActual('../../../common/api/hub-api-utils');
  return {
    ...actual,
    hubAPIPost: vi.fn().mockResolvedValue(undefined),
  };
});

import { hubAPIPost } from '../../../common/api/hub-api-utils';
import { requestGet } from '@ansible/common-ui/crud/Data';

const STAGING_REPO_UUID = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';

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
    pulp_href: `/pulp/api/v3/repositories/ansible/ansible/${STAGING_REPO_UUID}/`,
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

describe('useRejectCollections', () => {
  beforeEach(() => {
    capturedConfig = {};
    vi.mocked(hubAPIPost).mockClear();
  });

  it('opens reject collections bulk confirmation as danger', () => {
    const { result } = renderHook(() => useRejectCollections(vi.fn()), {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    });

    act(() => {
      result.current([mockCollection]);
    });

    expect(capturedConfig.title).toBe('Reject collections');
    expect(capturedConfig.isDanger).toBe(true);
  });

  it('runs reject actionFn via bulk confirmation', async () => {
    const { result } = renderHook(() => useRejectCollections(vi.fn()), {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    });

    act(() => {
      result.current([mockCollection]);
    });

    await act(async () => {
      await capturedConfig.actionFn?.(mockCollection);
    });

    expect(requestGet).toHaveBeenCalled();
    expect(hubAPIPost).toHaveBeenCalled();
  });
});
