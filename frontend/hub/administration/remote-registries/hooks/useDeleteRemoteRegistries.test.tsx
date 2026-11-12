/* eslint-disable i18next/no-literal-string */
import { act, renderHook } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RemoteRegistry } from '../RemoteRegistry';
import { useDeleteRemoteRegistries } from './useDeleteRemoteRegistries';

let capturedConfig: {
  title?: string;
  actionFn?: (registry: RemoteRegistry, signal: AbortSignal) => Promise<unknown>;
} = {};

vi.mock('../../../common/useHubBulkConfirmation', () => ({
  useHubBulkConfirmation: () => (config: typeof capturedConfig) => {
    capturedConfig = config;
  },
}));

vi.mock('@ansible/common-ui/useInvalidateCache/useInvalidateCache', () => ({
  useClearCache: () => ({ clearCacheByKey: vi.fn() }),
}));

vi.mock('./useRemoteRegistriesColumns', () => ({
  useRemoteRegistriesColumns: () => [],
}));

vi.mock('../../../common/api/hub-api-utils', async () => {
  const actual = await vi.importActual('../../../common/api/hub-api-utils');
  return {
    ...actual,
    hubAPIDelete: vi.fn().mockResolvedValue(undefined),
  };
});

vi.mock('@ansible/ansible-ui-framework', async () => {
  const actual = await vi.importActual('@ansible/ansible-ui-framework');
  return {
    ...actual,
    usePageNavigate: () => vi.fn(),
  };
});

import { hubAPIDelete } from '../../../common/api/hub-api-utils';

const REGISTRY_UUID = 'dddddddd-eeee-ffff-0000-111111111111';

const mockRegistry: RemoteRegistry = {
  id: '1',
  name: 'redhat-io',
  url: 'https://registry.redhat.io',
  pulp_href: `/api/galaxy/_ui/v1/execution-environments/registries/${REGISTRY_UUID}/`,
  policy: 'immediate',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  tls_validation: true,
  client_cert: null,
  ca_cert: null,
  last_sync_task: {
    task_id: '1',
    state: 'completed',
    started_at: '2024-01-01T00:00:00Z',
    finished_at: '2024-01-01T00:01:00Z',
    error: null,
  },
  download_concurrency: null,
  proxy_url: null,
  write_only_fields: [],
  rate_limit: null,
  is_indexable: true,
};

describe('useDeleteRemoteRegistries', () => {
  beforeEach(() => {
    capturedConfig = {};
    vi.mocked(hubAPIDelete).mockClear();
  });

  it('opens bulk confirmation for remote registries', () => {
    const { result } = renderHook(() => useDeleteRemoteRegistries(vi.fn()), {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    });

    act(() => {
      result.current([mockRegistry]);
    });

    expect(capturedConfig.title).toBe('Permanently delete remote registries');
  });

  it('deletes registry via actionFn', async () => {
    const { result } = renderHook(() => useDeleteRemoteRegistries(vi.fn()), {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    });

    act(() => {
      result.current([mockRegistry]);
    });

    await act(async () => {
      await capturedConfig.actionFn?.(mockRegistry, new AbortController().signal);
    });

    expect(hubAPIDelete).toHaveBeenCalled();
  });
});
