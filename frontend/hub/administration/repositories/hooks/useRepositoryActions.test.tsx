/* eslint-disable i18next/no-literal-string */
import { act, renderHook, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi, afterEach, beforeEach } from 'vitest';
import { useCollectionVersionsActionsRemove, useRepositoryActions } from './useRepositoryActions';
import { Repository } from '../Repository';

const mockDeleteRepositories = vi.fn();
const mockSyncRepositories = vi.fn();
const mockWriteToClipboard = vi.fn();
const mockAddAlert = vi.fn();
const mockPageNavigate = vi.fn();

vi.mock('./useDeleteRepositories', () => ({
  useDeleteRepositories: () => mockDeleteRepositories,
}));

vi.mock('./useSyncRepositories', () => ({
  useSyncRepositories: () => mockSyncRepositories,
}));

vi.mock('@ansible/ansible-ui-framework', async () => {
  const actual = await vi.importActual('@ansible/ansible-ui-framework');
  return {
    ...actual,
    usePageAlertToaster: () => ({ addAlert: mockAddAlert }),
    usePageNavigate: () => mockPageNavigate,
  };
});

vi.mock('@ansible/ansible-ui-framework/hooks/useClipboard', () => ({
  useClipboard: () => ({ writeToClipboard: mockWriteToClipboard }),
}));

vi.mock('../../../common/api/hub-api-utils', async () => {
  const actual = await vi.importActual('../../../common/api/hub-api-utils');
  return {
    ...actual,
    getRepositoryBasePath: vi.fn(),
    getRepoURL: vi.fn((path: string) => `https://hub.example/${path}/`),
  };
});

import { getRepositoryBasePath } from '../../../common/api/hub-api-utils';

// Mock dependent hooks
vi.mock('../../../collections/hooks/useDeleteCollectionsFromRepository', () => ({
  useDeleteCollectionsFromRepository: () => vi.fn(),
}));

// Mock isInsightsMode
vi.mock('../../../common/isInsights', () => ({
  isInsightsMode: vi.fn(() => false),
  filterInsightsBulkActions: vi.fn((actions: unknown[]) => actions),
}));

import { isInsightsMode } from '../../../common/isInsights';

// Configurable mock for useHubContext
let mockUser: Record<string, unknown> | null = null;
let mockHasPermission: (perm: string) => boolean = () => false;

vi.mock('../../../common/useHubContext', () => ({
  useHubContext: () => ({
    featureFlags: {},
    settings: {},
    user: mockUser,
    hasPermission: mockHasPermission,
  }),
}));

const mockRepository: Repository = {
  name: 'test-repo',
  pulp_href: '/pulp/repos/1/',
  description: 'Test repository',
  gpgkey: null,
  last_sync_task: {
    finished_at: '',
    started_at: '',
    state: 'completed',
    task_id: '1',
  },
  last_synced_metadata_time: null,
  latest_version_href: '/pulp/repos/1/versions/1/',
  private: false,
  pulp_created: '2024-01-01T00:00:00Z',
  pulp_labels: {},
  remote: null,
  retain_repo_versions: null,
  versions_href: '/pulp/repos/1/versions/',
};

function renderUseCollectionVersionsActionsRemove() {
  const callback = vi.fn();
  return renderHook(() => useCollectionVersionsActionsRemove(mockRepository, callback), {
    wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
  });
}

function getAction(actions: ReturnType<typeof useCollectionVersionsActionsRemove>, label: string) {
  return actions.find((action) => 'label' in action && action.label === label);
}

function isActionHidden(action: ReturnType<typeof getAction>) {
  if (action && 'isHidden' in action && typeof action.isHidden === 'function') {
    return (action.isHidden as () => boolean)();
  }
  return undefined;
}

describe('useCollectionVersionsActionsRemove', () => {
  beforeEach(() => {
    vi.mocked(isInsightsMode).mockReturnValue(false);
    mockUser = null;
    mockHasPermission = () => false;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return an array with a Remove action', () => {
    const { result } = renderUseCollectionVersionsActionsRemove();
    expect(Array.isArray(result.current)).toBe(true);
    expect(getAction(result.current, 'Remove')).toBeDefined();
  });

  it('should mark Remove action as danger', () => {
    const { result } = renderUseCollectionVersionsActionsRemove();
    const removeAction = getAction(result.current, 'Remove');
    expect(removeAction && 'isDanger' in removeAction && removeAction.isDanger).toBe(true);
  });

  describe('Platform mode (non-Insights)', () => {
    beforeEach(() => {
      vi.mocked(isInsightsMode).mockReturnValue(false);
    });

    it('should show Remove action regardless of permissions', () => {
      const { result } = renderUseCollectionVersionsActionsRemove();
      expect(isActionHidden(getAction(result.current, 'Remove'))).toBe(false);
    });
  });

  describe('Insights mode', () => {
    beforeEach(() => {
      vi.mocked(isInsightsMode).mockReturnValue(true);
    });

    describe('without permissions', () => {
      beforeEach(() => {
        mockHasPermission = () => false;
        mockUser = null;
      });

      it('should hide Remove action', () => {
        const { result } = renderUseCollectionVersionsActionsRemove();
        expect(isActionHidden(getAction(result.current, 'Remove'))).toBe(true);
      });
    });

    describe('with ansible.modify_ansible_repo_content permission', () => {
      beforeEach(() => {
        mockHasPermission = (perm: string) => perm === 'ansible.modify_ansible_repo_content';
      });

      it('should show Remove action', () => {
        const { result } = renderUseCollectionVersionsActionsRemove();
        expect(isActionHidden(getAction(result.current, 'Remove'))).toBe(false);
      });
    });

    describe('with superuser', () => {
      beforeEach(() => {
        mockUser = { is_superuser: true };
        mockHasPermission = () => false;
      });

      it('should show Remove action', () => {
        const { result } = renderUseCollectionVersionsActionsRemove();
        expect(isActionHidden(getAction(result.current, 'Remove'))).toBe(false);
      });
    });
  });
});

function getRepoAction(actions: ReturnType<typeof useRepositoryActions>, label: string) {
  return actions.find((action) => 'label' in action && action.label === label);
}

function clickRepoAction(action: ReturnType<typeof getRepoAction>, item: Repository) {
  if (action && 'onClick' in action) {
    (action.onClick as (item: Repository) => unknown)(item);
  }
}

function getRepoActionDisabledReason(action: ReturnType<typeof getRepoAction>, item: Repository) {
  const isDisabled = action && 'isDisabled' in action ? action.isDisabled : undefined;
  return typeof isDisabled === 'function'
    ? (isDisabled as (item: Repository) => string | undefined)(item)
    : isDisabled;
}

describe('useRepositoryActions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getRepositoryBasePath).mockResolvedValue('published');
  });

  it('returns edit, sync, copy CLI, and delete actions', () => {
    const { result } = renderHook(() => useRepositoryActions({ onRepositoriesDeleted: vi.fn() }), {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    });

    expect(getRepoAction(result.current, 'Edit repository')).toBeDefined();
    expect(getRepoAction(result.current, 'Sync repository')).toBeDefined();
    expect(getRepoAction(result.current, 'Copy CLI configuration')).toBeDefined();
    expect(getRepoAction(result.current, 'Delete repository')).toBeDefined();
  });

  it('navigates to edit repository', () => {
    const { result } = renderHook(() => useRepositoryActions({ onRepositoriesDeleted: vi.fn() }), {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    });

    const editAction = getRepoAction(result.current, 'Edit repository');
    act(() => {
      clickRepoAction(editAction, mockRepository);
    });

    expect(mockPageNavigate).toHaveBeenCalled();
  });

  it('disables sync when repository has no remote', () => {
    const { result } = renderHook(() => useRepositoryActions({ onRepositoriesDeleted: vi.fn() }), {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    });

    const syncAction = getRepoAction(result.current, 'Sync repository');
    expect(getRepoActionDisabledReason(syncAction, mockRepository)).toContain('no remotes');
  });

  it('calls syncRepositories when remote is configured', () => {
    const repoWithRemote = { ...mockRepository, remote: '/pulp/remotes/1/' };
    const { result } = renderHook(() => useRepositoryActions({ onRepositoriesDeleted: vi.fn() }), {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    });

    const syncAction = getRepoAction(result.current, 'Sync repository');
    act(() => {
      clickRepoAction(syncAction, repoWithRemote);
    });

    expect(mockSyncRepositories).toHaveBeenCalledWith(repoWithRemote);
  });

  it('copies CLI configuration when distribution exists', async () => {
    const { result } = renderHook(() => useRepositoryActions({ onRepositoriesDeleted: vi.fn() }), {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    });

    const copyAction = getRepoAction(result.current, 'Copy CLI configuration');
    act(() => {
      clickRepoAction(copyAction, mockRepository);
    });

    await waitFor(() => {
      expect(mockWriteToClipboard).toHaveBeenCalled();
    });
  });

  it('shows alert when copy CLI has no distribution', async () => {
    vi.mocked(getRepositoryBasePath).mockRejectedValue(new Error('missing'));

    const { result } = renderHook(() => useRepositoryActions({ onRepositoriesDeleted: vi.fn() }), {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    });

    const copyAction = getRepoAction(result.current, 'Copy CLI configuration');
    act(() => {
      clickRepoAction(copyAction, mockRepository);
    });

    await waitFor(() => {
      expect(mockAddAlert).toHaveBeenCalledWith(
        expect.objectContaining({
          variant: 'danger',
          title: 'There are no distributions associated with this repository.',
        })
      );
    });
  });

  it('disables delete for protected repositories', () => {
    const protectedRepo = { ...mockRepository, name: 'published' };
    const { result } = renderHook(() => useRepositoryActions({ onRepositoriesDeleted: vi.fn() }), {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    });

    const deleteAction = getRepoAction(result.current, 'Delete repository');
    expect(getRepoActionDisabledReason(deleteAction, protectedRepo)).toContain('Protected');
  });

  it('calls deleteRepositories on delete click', () => {
    const { result } = renderHook(() => useRepositoryActions({ onRepositoriesDeleted: vi.fn() }), {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    });

    const deleteAction = getRepoAction(result.current, 'Delete repository');
    act(() => {
      clickRepoAction(deleteAction, mockRepository);
    });

    expect(mockDeleteRepositories).toHaveBeenCalledWith([mockRepository]);
  });
});
