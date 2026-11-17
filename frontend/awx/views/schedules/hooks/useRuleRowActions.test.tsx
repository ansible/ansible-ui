import { IPageAction, PageActionType } from '@ansible/ansible-ui-framework';
import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { RuleListItemType } from '../types';
import { useRuleRowActions } from './useRuleRowActions';

const mockSetValue = vi.fn();
const mockGetValues = vi.fn();
const mockReset = vi.fn();
const mockSetStepData = vi.fn();
const mockSetIsOpen = vi.fn();

vi.mock('react-hook-form', () => ({
  useFormContext: () => ({
    setValue: mockSetValue,
    getValues: mockGetValues,
    reset: mockReset,
  }),
}));

vi.mock('@ansible/ansible-ui-framework/PageWizard/PageWizardProvider', () => ({
  usePageWizard: () => ({
    activeStep: { id: 'rules' },
    setStepData: mockSetStepData,
  }),
}));

function getActionByLabel(actions: ReturnType<typeof useRuleRowActions>, label: string) {
  return actions.find((action) => 'label' in action && action.label === label);
}

function getButtonActionByLabel(
  actions: IPageAction<RuleListItemType>[],
  label: string
): Extract<IPageAction<RuleListItemType>, { type: PageActionType.Button }> | undefined {
  return actions.find(
    (action): action is Extract<IPageAction<RuleListItemType>, { type: PageActionType.Button }> =>
      action.type === PageActionType.Button && 'label' in action && action.label === label
  );
}

describe('useRuleRowActions', () => {
  const rules: RuleListItemType[] = [
    { id: 1, rule: 'RRULE:FREQ=DAILY;INTERVAL=1' },
    { id: 2, rule: 'RRULE:FREQ=WEEKLY;INTERVAL=1' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetValues.mockReturnValue([]);
  });

  it('returns no actions when setIsOpen is not provided', () => {
    const { result } = renderHook(() => useRuleRowActions(rules));
    expect(result.current).toEqual([]);
  });

  it('exposes edit and delete rule actions', () => {
    const { result } = renderHook(() => useRuleRowActions(rules, mockSetIsOpen));

    expect(getActionByLabel(result.current, 'Edit rule')).toBeDefined();
    expect(getActionByLabel(result.current, 'Delete rule')).toMatchObject({ isDanger: true });
  });

  it('removes a rule and updates wizard step data on delete', () => {
    const { result } = renderHook(() => useRuleRowActions(rules, mockSetIsOpen));

    const deleteAction = getButtonActionByLabel(result.current, 'Delete rule');
    if (deleteAction && 'onClick' in deleteAction && typeof deleteAction.onClick === 'function') {
      (deleteAction.onClick as (item: RuleListItemType) => void)(rules[0]);
    }

    expect(mockSetValue).toHaveBeenCalledWith('rules', [rules[1]]);
    expect(mockSetStepData).toHaveBeenCalled();
  });

  it('opens edit drawer when edit rule is clicked', () => {
    const { result } = renderHook(() => useRuleRowActions(rules, mockSetIsOpen));

    const editAction = getButtonActionByLabel(result.current, 'Edit rule');
    if (editAction && 'onClick' in editAction && typeof editAction.onClick === 'function') {
      (editAction.onClick as (item: RuleListItemType) => void)(rules[0]);
    }

    expect(mockSetIsOpen).toHaveBeenCalledWith(1);
    expect(mockReset).toHaveBeenCalled();
  });
});
