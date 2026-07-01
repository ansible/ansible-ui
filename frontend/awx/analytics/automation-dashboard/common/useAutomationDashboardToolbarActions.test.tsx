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
const mockOnSave = vi.fn();

function renderActions(
  filterState: IFilterState | undefined,
  selectedFilterSet: IDashboardFilterSet | undefined
) {
  return renderHook(() =>
    useAutomationDashboardToolbarActions({
      filterState,
      selectedFilterSet,
      onDelete: mockOnDelete,
      onSave: mockOnSave,
    })
  ).result.current;
}

function getDropdownSubAction(action: Dropdown, label: string): IPageActionButton {
  expect(action.type).toBe(PageActionType.Dropdown);
  const sub = action.actions.find(
    (a): a is IPageActionButton => a.type !== PageActionType.Seperator && a.label === label
  );
  expect(sub).toBeDefined();
  return sub!;
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

    test('should disable "Save report" when filter state equals the default', () => {
      const action = renderActions(defaultFilterState, filterSet)[0] as Dropdown;
      const subAction = getDropdownSubAction(action, 'Save report');
      expect(subAction?.isDisabled).toBeTruthy();
    });

    test('should disable "Rename report" when filter state equals the default', () => {
      const action = renderActions(defaultFilterState, filterSet)[0] as Dropdown;
      const subAction = getDropdownSubAction(action, 'Rename report');
      expect(subAction?.isDisabled).toBeTruthy();
    });

    test('should enable "Save report" when filter state differs from the default', () => {
      const action = renderActions(nonDefaultFilterState, filterSet)[0] as Dropdown;
      const subAction = getDropdownSubAction(action, 'Save report');
      expect(subAction?.isDisabled).toBeFalsy();
    });

    test('should enable "Rename report" when filter state differs from the default', () => {
      const action = renderActions(nonDefaultFilterState, filterSet)[0] as Dropdown;
      const subAction = getDropdownSubAction(action, 'Rename report');
      expect(subAction?.isDisabled).toBeFalsy();
    });

    test('should disable "Delete report" with admin-only message when user is not a superuser', () => {
      mockActiveAwxUser.is_superuser = false;
      const action = renderActions(defaultFilterState, filterSet)[0] as Dropdown;
      const subAction = getDropdownSubAction(action, 'Delete report');
      expect(subAction?.isDisabled).toBe('Only administrators can delete reports');
    });

    test('should enable "Delete report" for superusers', () => {
      const action = renderActions(defaultFilterState, filterSet)[0] as Dropdown;
      const subAction = getDropdownSubAction(action, 'Delete report');
      expect(subAction?.isDisabled).toBeFalsy();
    });

    test('should disable "Save report" with admin-only message when user is not a superuser', () => {
      mockActiveAwxUser.is_superuser = false;
      const action = renderActions(nonDefaultFilterState, filterSet)[0] as Dropdown;
      const subAction = getDropdownSubAction(action, 'Save report');
      expect(subAction?.isDisabled).toBe('Only administrators can save reports');
    });

    test('should disable "Rename report" with admin-only message when user is not a superuser', () => {
      mockActiveAwxUser.is_superuser = false;
      const action = renderActions(nonDefaultFilterState, filterSet)[0] as Dropdown;
      const subAction = getDropdownSubAction(action, 'Rename report');
      expect(subAction?.isDisabled).toBe('Only administrators can save reports');
    });

    test('should contain exactly 3 sub-actions', () => {
      const action = renderActions(defaultFilterState, filterSet)[0] as Dropdown;
      expect(action.type).toBe(PageActionType.Dropdown);
      expect(action.actions).toHaveLength(3);
    });

    test('should include "Save report", "Rename report", "Delete report" sub-actions', () => {
      const action = renderActions(defaultFilterState, filterSet)[0] as Dropdown;
      expect(action.type).toBe(PageActionType.Dropdown);

      const labels = action.actions.flatMap((a) =>
        a.type === PageActionType.Seperator ? [] : [a.label]
      );
      expect(labels).toContain('Save report');
      expect(labels).toContain('Rename report');
      expect(labels).toContain('Delete report');
    });

    test('should call createToolbarFilterSet when "Save report" is clicked', () => {
      const action = renderActions(nonDefaultFilterState, filterSet)[0] as Dropdown;
      const subAction = getDropdownSubAction(action, 'Save report');
      subAction?.onClick();
      expect(mockCreateFn).toHaveBeenCalledWith(nonDefaultFilterState);
    });

    test('should call updateToolbarFilterSet when "Rename report" is clicked', () => {
      const action = renderActions(nonDefaultFilterState, filterSet)[0] as Dropdown;
      const subAction = getDropdownSubAction(action, 'Rename report');
      subAction?.onClick();
      expect(mockUpdateFn).toHaveBeenCalledWith(filterSet, nonDefaultFilterState);
    });

    test('should call removeToolbarFilterSet when "Delete report" is clicked', () => {
      const action = renderActions(nonDefaultFilterState, filterSet)[0] as Dropdown;
      const subAction = getDropdownSubAction(action, 'Delete report');
      subAction?.onClick();
      expect(mockRemoveFn).toHaveBeenCalledWith(filterSet);
    });
  });
});
