/* eslint-disable i18next/no-literal-string */
import { renderHook } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi, afterEach, beforeEach } from 'vitest';
import { useCollectionVersionsActionsRemove } from './useRepositoryActions';
import { Repository } from '../Repository';

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
