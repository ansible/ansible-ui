/* eslint-disable i18next/no-literal-string */
import { act, renderHook } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Repository } from '../Repository';
import { useDeleteRepositories } from './useDeleteRepositories';

let capturedConfig: {
  title?: string;
  confirmText?: string;
  actionButtonText?: string;
  alertPrompts?: string[];
  actionFn?: (repository: Repository, signal: AbortSignal) => Promise<unknown>;
} = {};

vi.mock('../../../common/useHubBulkConfirmation', () => ({
  useHubBulkConfirmation: () => (config: typeof capturedConfig) => {
    capturedConfig = config;
  },
}));

vi.mock('@ansible/common-ui/useInvalidateCache/useInvalidateCache', () => ({
  useClearCache: () => ({ clearCacheByKey: vi.fn() }),
}));

vi.mock('./useRepositoriesColumns', () => ({
  useRepositoriesColumns: () => [],
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

const REPO_UUID = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';

const mockRepository: Repository = {
  name: 'staging',
  pulp_href: `/pulp/api/v3/repositories/ansible/ansible/${REPO_UUID}/`,
  description: '',
  gpgkey: null,
  last_sync_task: {
    finished_at: '',
    started_at: '',
    state: 'completed',
    task_id: '1',
  },
  last_synced_metadata_time: null,
  latest_version_href: '',
  private: false,
  pulp_created: '2024-01-01T00:00:00Z',
  pulp_labels: {},
  remote: null,
  retain_repo_versions: null,
  versions_href: '',
};

describe('useDeleteRepositories', () => {
  beforeEach(() => {
    capturedConfig = {};
    vi.mocked(hubAPIDelete).mockClear();
  });

  it('opens bulk confirmation with delete repositories title', () => {
    const { result } = renderHook(() => useDeleteRepositories(vi.fn()), {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    });

    act(() => {
      result.current([mockRepository]);
    });

    expect(capturedConfig.title).toBe('Permanently delete repositories');
    expect(capturedConfig.actionButtonText).toBe('Delete repositories');
    expect(capturedConfig.alertPrompts?.[0]).toContain('associated resources');
  });

  it('calls hubAPIDelete for each repository in actionFn', async () => {
    const { result } = renderHook(() => useDeleteRepositories(vi.fn()), {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    });

    act(() => {
      result.current([mockRepository]);
    });

    await act(async () => {
      await capturedConfig.actionFn?.(mockRepository, new AbortController().signal);
    });

    expect(hubAPIDelete).toHaveBeenCalled();
  });
});
