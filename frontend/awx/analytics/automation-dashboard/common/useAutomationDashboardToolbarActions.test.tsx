/* eslint-disable i18next/no-literal-string */
import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import {
  IPageActionButton,
  IPageActionDropdown,
  PageActionSelection,
  PageActionType,
  ToolbarFilterType,
} from '@ansible/ansible-ui-framework';
import type { IFilterState, IToolbarFilter } from '@ansible/ansible-ui-framework';
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

const invalidCustomRangeFilterState: IFilterState = {
  period: ['custom'],
};

const validCustomRangeFilterState: IFilterState = {
  period: ['custom', '2024-01-01'],
};

const requiredDateRangeToolbarFilters: IToolbarFilter[] = [
  {
    type: ToolbarFilterType.DateRange,
    key: 'period',
    label: 'Period',
    query: 'period',
    options: [
      { label: 'Last 7 days', value: AutomationDashboardDateRangeFilterPresets.last_7_days },
      { label: 'Custom', value: 'custom', isCustom: true },
    ],
    placeholder: 'Filter by period',
    isRequired: true,
  },
];

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
  selectedFilterSet: IDashboardFilterSet | undefined,
  toolbarFilters?: IToolbarFilter[]
) {
  return renderHook(() =>
    useAutomationDashboardToolbarActions({
      filterState,
      toolbarFilters,
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

    test('should label the button "Create new report"', () => {
      const action = renderActions(defaultFilterState, undefined)[0] as IPageActionButton;

      expect(action.label).toBe('Create new report');
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

    test('should disable the button with an invalid-filter message when a required custom date range has no start date', () => {
      const action = renderActions(
        invalidCustomRangeFilterState,
        undefined,
        requiredDateRangeToolbarFilters
      )[0] as IPageActionButton;

      expect(action.isDisabled).toBe('Enter a valid custom date range before saving');
    });

    test('should enable the button when the required custom date range has a valid start date', () => {
      const action = renderActions(
        validCustomRangeFilterState,
        undefined,
        requiredDateRangeToolbarFilters
      )[0] as IPageActionButton;

      expect(action.isDisabled).toBeFalsy();
    });
  });

  describe('when selectedFilterSet is defined', () => {
    test('should return a single Dropdown action', () => {
      const actions = renderActions(defaultFilterState, filterSet);

      expect(actions).toHaveLength(1);
      expect(actions[0].type).toBe(PageActionType.Dropdown);
    });

    test('should label the dropdown "Report actions"', () => {
      const action = renderActions(defaultFilterState, filterSet)[0] as Dropdown;

      expect(action.label).toBe('Report actions');
    });

    test('should never disable the dropdown itself', () => {
      const action = renderActions(defaultFilterState, filterSet)[0] as Dropdown;

      expect(action.isDisabled).toBeFalsy();
    });

    test('should disable "Create new report" when filter state equals the default', () => {
      const action = renderActions(defaultFilterState, filterSet)[0] as Dropdown;
      const subAction = getDropdownSubAction(action, 'Create new report');
      expect(subAction?.isDisabled).toBeTruthy();
    });

    test('should enable "Create new report" when filter state differs from the default', () => {
      const action = renderActions(nonDefaultFilterState, filterSet)[0] as Dropdown;
      const subAction = getDropdownSubAction(action, 'Create new report');
      expect(subAction?.isDisabled).toBeFalsy();
    });

    test('should keep "Update report" enabled when filter state equals the default', () => {
      const action = renderActions(defaultFilterState, filterSet)[0] as Dropdown;
      const subAction = getDropdownSubAction(action, 'Update report');
      expect(subAction?.isDisabled).toBeFalsy();
    });

    test('should keep "Update report" enabled when filter state differs from the default', () => {
      const action = renderActions(nonDefaultFilterState, filterSet)[0] as Dropdown;
      const subAction = getDropdownSubAction(action, 'Update report');
      expect(subAction?.isDisabled).toBeFalsy();
    });

    test('should disable "Update report" with an invalid-filter message when a required custom date range is invalid', () => {
      const action = renderActions(
        invalidCustomRangeFilterState,
        filterSet,
        requiredDateRangeToolbarFilters
      )[0] as Dropdown;
      const subAction = getDropdownSubAction(action, 'Update report');
      expect(subAction?.isDisabled).toBe('Enter a valid custom date range before updating');
    });

    test('should enable "Update report" once the required custom date range becomes valid', () => {
      const action = renderActions(
        validCustomRangeFilterState,
        filterSet,
        requiredDateRangeToolbarFilters
      )[0] as Dropdown;
      const subAction = getDropdownSubAction(action, 'Update report');
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

    test('should keep "Delete report" enabled when a required custom date range is invalid', () => {
      const action = renderActions(
        invalidCustomRangeFilterState,
        filterSet,
        requiredDateRangeToolbarFilters
      )[0] as Dropdown;
      const subAction = getDropdownSubAction(action, 'Delete report');
      expect(subAction?.isDisabled).toBeFalsy();
    });

    test('should disable "Create new report" with admin-only message when user is not a superuser', () => {
      mockActiveAwxUser.is_superuser = false;
      const action = renderActions(nonDefaultFilterState, filterSet)[0] as Dropdown;
      const subAction = getDropdownSubAction(action, 'Create new report');
      expect(subAction?.isDisabled).toBe('Only administrators can save reports');
    });

    test('should disable "Update report" with admin-only message when user is not a superuser', () => {
      mockActiveAwxUser.is_superuser = false;
      const action = renderActions(nonDefaultFilterState, filterSet)[0] as Dropdown;
      const subAction = getDropdownSubAction(action, 'Update report');
      expect(subAction?.isDisabled).toBe('Only administrators can save reports');
    });

    test('should disable "Update report" with admin-only message even when the filter state is default', () => {
      mockActiveAwxUser.is_superuser = false;
      const action = renderActions(defaultFilterState, filterSet)[0] as Dropdown;
      const subAction = getDropdownSubAction(action, 'Update report');
      expect(subAction?.isDisabled).toBe('Only administrators can save reports');
    });

    test('should contain exactly 3 sub-actions', () => {
      const action = renderActions(defaultFilterState, filterSet)[0] as Dropdown;
      expect(action.type).toBe(PageActionType.Dropdown);
      expect(action.actions).toHaveLength(3);
    });

    test('should include "Create new report", "Update report", "Delete report" sub-actions', () => {
      const action = renderActions(defaultFilterState, filterSet)[0] as Dropdown;
      expect(action.type).toBe(PageActionType.Dropdown);

      const labels = action.actions.flatMap((a) =>
        a.type === PageActionType.Seperator ? [] : [a.label]
      );
      expect(labels).toContain('Create new report');
      expect(labels).toContain('Update report');
      expect(labels).toContain('Delete report');
    });

    test('should call createToolbarFilterSet when "Create new report" is clicked', () => {
      const action = renderActions(nonDefaultFilterState, filterSet)[0] as Dropdown;
      const subAction = getDropdownSubAction(action, 'Create new report');
      subAction?.onClick();
      expect(mockCreateFn).toHaveBeenCalledWith(nonDefaultFilterState);
    });

    test('should call updateToolbarFilterSet when "Update report" is clicked', () => {
      const action = renderActions(nonDefaultFilterState, filterSet)[0] as Dropdown;
      const subAction = getDropdownSubAction(action, 'Update report');
      subAction?.onClick();
      expect(mockUpdateFn).toHaveBeenCalledWith(filterSet, nonDefaultFilterState);
    });

    test('should call updateToolbarFilterSet when "Update report" is clicked on the default filter state', () => {
      const action = renderActions(defaultFilterState, filterSet)[0] as Dropdown;
      const subAction = getDropdownSubAction(action, 'Update report');
      subAction?.onClick();
      expect(mockUpdateFn).toHaveBeenCalledWith(filterSet, defaultFilterState);
    });

    test('should call removeToolbarFilterSet when "Delete report" is clicked', () => {
      const action = renderActions(nonDefaultFilterState, filterSet)[0] as Dropdown;
      const subAction = getDropdownSubAction(action, 'Delete report');
      subAction?.onClick();
      expect(mockRemoveFn).toHaveBeenCalledWith(filterSet);
    });

    test('should still return the Dropdown (not fall back to a single Button) when the required custom date range is invalid', () => {
      const action = renderActions(
        invalidCustomRangeFilterState,
        filterSet,
        requiredDateRangeToolbarFilters
      )[0];

      expect(action.type).toBe(PageActionType.Dropdown);
    });

    test('should disable "Create new report" with an invalid-filter message when the required custom date range is invalid', () => {
      const action = renderActions(
        invalidCustomRangeFilterState,
        filterSet,
        requiredDateRangeToolbarFilters
      )[0] as Dropdown;
      const subAction = getDropdownSubAction(action, 'Create new report');

      expect(subAction?.isDisabled).toBe('Enter a valid custom date range before saving');
    });

    test('should enable "Create new report" once the required custom date range becomes valid', () => {
      const action = renderActions(
        validCustomRangeFilterState,
        filterSet,
        requiredDateRangeToolbarFilters
      )[0] as Dropdown;
      const subAction = getDropdownSubAction(action, 'Create new report');

      expect(subAction?.isDisabled).toBeFalsy();
    });
  });
});
