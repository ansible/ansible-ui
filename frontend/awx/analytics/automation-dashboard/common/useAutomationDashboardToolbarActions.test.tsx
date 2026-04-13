/* eslint-disable i18next/no-literal-string */
import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import {
  IPageActionButton,
  IPageActionDropdown,
  PageActionSelection,
  PageActionType,
} from '@ansible/ansible-ui-framework';
import type { IFilterState } from '@ansible/ansible-ui-framework';
import { AutomationDashboardDateRangeFilterPresets } from '../constants';
import type { IDashboardFilterSet, IJobTemplate } from '../types';
import { useAutomationDashboardToolbarActions } from './useAutomationDashboardToolbarActions';

type Dropdown = IPageActionDropdown<IJobTemplate>;

// ─── Mocks ────────────────────────────────────────────────────────────────────

const { mockCreateFn, mockUpdateFn, mockRemoveFn, mockActiveAwxUser } = vi.hoisted(() => ({
  mockCreateFn: vi.fn(),
  mockUpdateFn: vi.fn(),
  mockRemoveFn: vi.fn(),
  mockActiveAwxUser: { is_superuser: true },
}));

vi.mock('./useCreateToolbarFilterSet', () => ({
  useCreateToolbarFilterSet: vi.fn(() => mockCreateFn),
}));

vi.mock('./useUpdateToolbarFilterSet', () => ({
  useUpdateToolbarFilterSet: vi.fn(() => mockUpdateFn),
}));

vi.mock('./useRemoveToolbarFilterSet', () => ({
  useRemoveToolbarFilterSet: vi.fn(() => mockRemoveFn),
}));

vi.mock('../../../common/useAwxActiveUser', () => ({
  useAwxActiveUser: vi.fn(() => ({ activeAwxUser: mockActiveAwxUser })),
}));

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const defaultFilterState: IFilterState = {
  period: [AutomationDashboardDateRangeFilterPresets.last_7_days],
};

const nonDefaultFilterState: IFilterState = {
  period: [AutomationDashboardDateRangeFilterPresets.last_30_days],
};

const filterSet: IDashboardFilterSet = {
  id: 1,
  name: 'Report A',
  filters: '{}',
  is_default: false,
};

const mockOnDelete = vi.fn();
const mockOnCreate = vi.fn();
const mockOnUpdate = vi.fn();

function renderActions(
  filterState: IFilterState | undefined,
  selectedFilterSet: IDashboardFilterSet | undefined
) {
  return renderHook(() =>
    useAutomationDashboardToolbarActions({
      filterState,
      selectedFilterSet,
      onDelete: mockOnDelete,
      onCreate: mockOnCreate,
      onUpdate: mockOnUpdate,
    })
  ).result.current;
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('useAutomationDashboardToolbarActions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockActiveAwxUser.is_superuser = true;
  });

  describe('when no selectedFilterSet', () => {
    test('should return a single Button action', () => {
      const actions = renderActions(defaultFilterState, undefined);

      expect(actions).toHaveLength(1);
      expect(actions[0].type).toBe(PageActionType.Button);
    });

    test('should label the button "Save as report"', () => {
      const action = renderActions(defaultFilterState, undefined)[0] as IPageActionButton;

      expect(action.label).toBe('Save as report');
    });

    test('should have None selection', () => {
      const action = renderActions(defaultFilterState, undefined)[0] as IPageActionButton;

      expect(action.selection).toBe(PageActionSelection.None);
    });

    test('should disable the button when filter state equals the default', () => {
      const action = renderActions(defaultFilterState, undefined)[0] as IPageActionButton;

      expect(action.isDisabled).toBeTruthy();
    });

    test('should enable the button when filter state differs from the default', () => {
      const action = renderActions(nonDefaultFilterState, undefined)[0] as IPageActionButton;

      expect(action.isDisabled).toBeFalsy();
    });

    test('should disable the button with admin-only message when user is not a superuser', () => {
      mockActiveAwxUser.is_superuser = false;

      const action = renderActions(nonDefaultFilterState, undefined)[0] as IPageActionButton;

      expect(action.isDisabled).toBe('Only administrators can save reports');
    });

    test('should disable the button even on non-default filter state when user is not a superuser', () => {
      mockActiveAwxUser.is_superuser = false;

      const action = renderActions(nonDefaultFilterState, undefined)[0] as IPageActionButton;

      expect(action.isDisabled).toBeTruthy();
    });

    test('should call createToolbarFilterSet on click', () => {
      const action = renderActions(nonDefaultFilterState, undefined)[0] as IPageActionButton;
      action.onClick();
      expect(mockCreateFn).toHaveBeenCalledWith(nonDefaultFilterState);
    });
  });

  describe('when selectedFilterSet is defined', () => {
    test('should return a single Dropdown action', () => {
      const actions = renderActions(defaultFilterState, filterSet);

      expect(actions).toHaveLength(1);
      expect(actions[0].type).toBe(PageActionType.Dropdown);
    });

    test('should label the dropdown "Save as report"', () => {
      const action = renderActions(defaultFilterState, filterSet)[0] as Dropdown;

      expect(action.label).toBe('Save as report');
    });

    test('should never disable the dropdown itself', () => {
      const action = renderActions(defaultFilterState, filterSet)[0] as Dropdown;

      expect(action.isDisabled).toBeFalsy();
    });

    test('should disable "Create new report" when filter state equals the default', () => {
      const action = renderActions(defaultFilterState, filterSet)[0] as Dropdown;

      if (action.type === PageActionType.Dropdown) {
        const sub = action.actions.find(
          (a): a is IPageActionButton =>
            a.type !== PageActionType.Seperator && a.label === 'Create new report'
        );
        expect(sub?.isDisabled).toBeTruthy();
      }
    });

    test('should disable "Edit current report" when filter state equals the default', () => {
      const action = renderActions(defaultFilterState, filterSet)[0] as Dropdown;

      if (action.type === PageActionType.Dropdown) {
        const sub = action.actions.find(
          (a): a is IPageActionButton =>
            a.type !== PageActionType.Seperator && a.label === 'Edit current report'
        );
        expect(sub?.isDisabled).toBeTruthy();
      }
    });

    test('should enable "Create new report" when filter state differs from the default', () => {
      const action = renderActions(nonDefaultFilterState, filterSet)[0] as Dropdown;

      if (action.type === PageActionType.Dropdown) {
        const sub = action.actions.find(
          (a): a is IPageActionButton =>
            a.type !== PageActionType.Seperator && a.label === 'Create new report'
        );
        expect(sub?.isDisabled).toBeFalsy();
      }
    });

    test('should enable "Edit current report" when filter state differs from the default', () => {
      const action = renderActions(nonDefaultFilterState, filterSet)[0] as Dropdown;

      if (action.type === PageActionType.Dropdown) {
        const sub = action.actions.find(
          (a): a is IPageActionButton =>
            a.type !== PageActionType.Seperator && a.label === 'Edit current report'
        );
        expect(sub?.isDisabled).toBeFalsy();
      }
    });

    test('should disable "Delete current report" with admin-only message when user is not a superuser', () => {
      mockActiveAwxUser.is_superuser = false;

      const action = renderActions(defaultFilterState, filterSet)[0] as Dropdown;

      if (action.type === PageActionType.Dropdown) {
        const sub = action.actions.find(
          (a): a is IPageActionButton =>
            a.type !== PageActionType.Seperator && a.label === 'Delete current report'
        );
        expect(sub?.isDisabled).toBe('Only administrators can delete reports');
      }
    });

    test('should enable "Delete current report" for superusers', () => {
      const action = renderActions(defaultFilterState, filterSet)[0] as Dropdown;

      if (action.type === PageActionType.Dropdown) {
        const sub = action.actions.find(
          (a): a is IPageActionButton =>
            a.type !== PageActionType.Seperator && a.label === 'Delete current report'
        );
        expect(sub?.isDisabled).toBeFalsy();
      }
    });

    test('should disable "Create new report" with admin-only message when user is not a superuser', () => {
      mockActiveAwxUser.is_superuser = false;

      const action = renderActions(nonDefaultFilterState, filterSet)[0] as Dropdown;

      if (action.type === PageActionType.Dropdown) {
        const sub = action.actions.find(
          (a): a is IPageActionButton =>
            a.type !== PageActionType.Seperator && a.label === 'Create new report'
        );
        expect(sub?.isDisabled).toBe('Only administrators can save reports');
      }
    });

    test('should disable "Edit current report" with admin-only message when user is not a superuser', () => {
      mockActiveAwxUser.is_superuser = false;

      const action = renderActions(nonDefaultFilterState, filterSet)[0] as Dropdown;

      if (action.type === PageActionType.Dropdown) {
        const sub = action.actions.find(
          (a): a is IPageActionButton =>
            a.type !== PageActionType.Seperator && a.label === 'Edit current report'
        );
        expect(sub?.isDisabled).toBe('Only administrators can save reports');
      }
    });

    test('should contain exactly 3 sub-actions', () => {
      const action = renderActions(defaultFilterState, filterSet)[0] as Dropdown;

      if (action.type === PageActionType.Dropdown) {
        expect(action.actions).toHaveLength(3);
      }
    });

    test('should include "Create new report", "Edit current report", "Delete current report" sub-actions', () => {
      const action = renderActions(defaultFilterState, filterSet)[0] as Dropdown;

      if (action.type === PageActionType.Dropdown) {
        const labels = action.actions.flatMap((a) =>
          a.type === PageActionType.Seperator ? [] : [a.label]
        );
        expect(labels).toContain('Create new report');
        expect(labels).toContain('Edit current report');
        expect(labels).toContain('Delete current report');
      }
    });

    test('should call createToolbarFilterSet when "Create new report" is clicked', () => {
      const action = renderActions(nonDefaultFilterState, filterSet)[0] as Dropdown;

      if (action.type === PageActionType.Dropdown) {
        const sub = action.actions.find(
          (a): a is IPageActionButton =>
            a.type !== PageActionType.Seperator && a.label === 'Create new report'
        );
        sub?.onClick();
      }

      expect(mockCreateFn).toHaveBeenCalledWith(nonDefaultFilterState);
    });

    test('should call updateToolbarFilterSet when "Edit current report" is clicked', () => {
      const action = renderActions(nonDefaultFilterState, filterSet)[0] as Dropdown;

      if (action.type === PageActionType.Dropdown) {
        const sub = action.actions.find(
          (a): a is IPageActionButton =>
            a.type !== PageActionType.Seperator && a.label === 'Edit current report'
        );
        sub?.onClick();
      }

      expect(mockUpdateFn).toHaveBeenCalledWith(filterSet, nonDefaultFilterState);
    });

    test('should call removeToolbarFilterSet when "Delete current report" is clicked', () => {
      const action = renderActions(nonDefaultFilterState, filterSet)[0] as Dropdown;

      if (action.type === PageActionType.Dropdown) {
        const sub = action.actions.find(
          (a): a is IPageActionButton =>
            a.type !== PageActionType.Seperator && a.label === 'Delete current report'
        );
        sub?.onClick();
      }

      expect(mockRemoveFn).toHaveBeenCalledWith(filterSet);
    });
  });
});
