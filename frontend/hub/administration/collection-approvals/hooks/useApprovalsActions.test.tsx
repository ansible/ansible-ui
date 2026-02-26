/* eslint-disable i18next/no-literal-string */
import { renderHook } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi, afterEach, beforeEach } from 'vitest';
import { useApprovalsActions } from './useApprovalsActions';

// Mock dependent hooks
vi.mock('../../../collections/hooks/useCopyToRepository', () => ({
  useCopyToRepository: () => vi.fn(),
}));

vi.mock('./useApproveCollections', () => ({
  useApproveCollectionsFrameworkModal: () => vi.fn(),
}));

vi.mock('./useRejectCollections', () => ({
  useRejectCollections: () => vi.fn(),
}));

vi.mock('./useApprovalActions', () => ({
  approveCollection: vi.fn(),
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

function renderUseApprovalsActions() {
  const callback = vi.fn();
  return renderHook(() => useApprovalsActions(callback), {
    wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
  });
}

function getAction(actions: ReturnType<typeof useApprovalsActions>, label: string) {
  return actions.find((action) => 'label' in action && action.label === label);
}

function isActionHidden(action: ReturnType<typeof getAction>) {
  if (action && 'isHidden' in action && typeof action.isHidden === 'function') {
    return (action.isHidden as () => boolean)();
  }
  return undefined;
}

describe('useApprovalsActions', () => {
  beforeEach(() => {
    vi.mocked(isInsightsMode).mockReturnValue(false);
    mockUser = null;
    mockHasPermission = () => false;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return an array of actions', () => {
    const { result } = renderUseApprovalsActions();
    expect(Array.isArray(result.current)).toBe(true);
    expect(result.current.length).toBeGreaterThan(0);
  });

  it('should include Approve and sign collections action', () => {
    const { result } = renderUseApprovalsActions();
    expect(getAction(result.current, 'Approve and sign collections')).toBeDefined();
  });

  it('should include Reject collections action', () => {
    const { result } = renderUseApprovalsActions();
    expect(getAction(result.current, 'Reject collections')).toBeDefined();
  });

  describe('Platform mode (non-Insights)', () => {
    beforeEach(() => {
      vi.mocked(isInsightsMode).mockReturnValue(false);
    });

    it('should show Approve and sign collections action', () => {
      const { result } = renderUseApprovalsActions();
      expect(isActionHidden(getAction(result.current, 'Approve and sign collections'))).toBe(false);
    });

    it('should show Reject collections action', () => {
      const { result } = renderUseApprovalsActions();
      expect(isActionHidden(getAction(result.current, 'Reject collections'))).toBe(false);
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

      it('should hide Approve and sign collections action', () => {
        const { result } = renderUseApprovalsActions();
        expect(isActionHidden(getAction(result.current, 'Approve and sign collections'))).toBe(
          true
        );
      });

      it('should hide Reject collections action', () => {
        const { result } = renderUseApprovalsActions();
        expect(isActionHidden(getAction(result.current, 'Reject collections'))).toBe(true);
      });
    });

    describe('with ansible.modify_ansible_repo_content permission', () => {
      beforeEach(() => {
        mockHasPermission = (perm: string) => perm === 'ansible.modify_ansible_repo_content';
      });

      it('should show Approve and sign collections action', () => {
        const { result } = renderUseApprovalsActions();
        expect(isActionHidden(getAction(result.current, 'Approve and sign collections'))).toBe(
          false
        );
      });

      it('should show Reject collections action', () => {
        const { result } = renderUseApprovalsActions();
        expect(isActionHidden(getAction(result.current, 'Reject collections'))).toBe(false);
      });
    });

    describe('with superuser', () => {
      beforeEach(() => {
        mockUser = { is_superuser: true };
        mockHasPermission = () => false;
      });

      it('should show Approve and sign collections action', () => {
        const { result } = renderUseApprovalsActions();
        expect(isActionHidden(getAction(result.current, 'Approve and sign collections'))).toBe(
          false
        );
      });

      it('should show Reject collections action', () => {
        const { result } = renderUseApprovalsActions();
        expect(isActionHidden(getAction(result.current, 'Reject collections'))).toBe(false);
      });
    });
  });
});
