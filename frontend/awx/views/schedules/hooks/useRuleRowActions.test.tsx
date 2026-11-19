import { IPageAction, PageActionType } from '@ansible/ansible-ui-framework';
import { renderHook } from '@testing-library/react';
import { RRule } from 'rrule';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { RuleListItemType } from '../types';
import { useRuleRowActions } from './useRuleRowActions';

const mockSetValue = vi.fn();
const mockGetValues = vi.fn();
const mockReset = vi.fn();
const mockSetStepData = vi.fn();
const mockSetIsOpen = vi.fn();
let activeStepId = 'rules';

vi.mock('react-hook-form', () => ({
  useFormContext: () => ({
    setValue: mockSetValue,
    getValues: mockGetValues,
    reset: mockReset,
  }),
}));

vi.mock('@ansible/ansible-ui-framework/PageWizard/PageWizardProvider', () => ({
  usePageWizard: () => ({
    activeStep: { id: activeStepId },
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

function invokeButtonClick(
  action: Extract<IPageAction<RuleListItemType>, { type: PageActionType.Button }> | undefined,
  item: RuleListItemType
) {
  if (action && 'onClick' in action && typeof action.onClick === 'function') {
    (action.onClick as (rule: RuleListItemType) => void)(item);
  }
}

describe('useRuleRowActions', () => {
  const rules: RuleListItemType[] = [
    { id: 1, rule: 'RRULE:FREQ=DAILY;INTERVAL=1' },
    { id: 2, rule: 'RRULE:FREQ=WEEKLY;INTERVAL=1' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    activeStepId = 'rules';
    mockGetValues.mockReturnValue([]);
    mockSetStepData.mockImplementation((updater: (prev: Record<string, unknown>) => unknown) =>
      updater({})
    );
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

  it('stores filtered rules on the wizard step when a rule is deleted', () => {
    const { result } = renderHook(() => useRuleRowActions(rules, mockSetIsOpen));
    invokeButtonClick(getButtonActionByLabel(result.current, 'Delete rule'), rules[0]);

    expect(mockSetStepData).toHaveBeenCalled();
    const updater = mockSetStepData.mock.calls[0][0] as (prev: Record<string, unknown>) => {
      rules?: { rule?: RuleListItemType[] };
    };
    expect(updater({}).rules?.rule).toEqual([rules[1]]);
  });

  it('edits and deletes exceptions and loads until or count end conditions', () => {
    activeStepId = 'exceptions';
    const until = new Date('2024-06-01T15:30:00.000Z');
    const untilRule = new RRule({
      freq: RRule.DAILY,
      interval: 1,
      until,
      tzid: 'UTC',
    }).toString();
    const countRule = new RRule({ freq: RRule.WEEKLY, count: 4 }).toString();
    const exceptionRules: RuleListItemType[] = [
      { id: 3, rule: untilRule },
      { id: 4, rule: countRule },
      { id: 5, rule: '' },
    ];
    mockGetValues.mockImplementation((field: string) =>
      field === 'rules' ? [{ id: 9 }] : undefined
    );

    const { result } = renderHook(() => useRuleRowActions(exceptionRules, mockSetIsOpen));

    expect(getActionByLabel(result.current, 'Edit exception')).toBeDefined();
    expect(getActionByLabel(result.current, 'Delete exception')).toMatchObject({ isDanger: true });

    invokeButtonClick(getButtonActionByLabel(result.current, 'Edit exception'), exceptionRules[0]);
    expect(mockSetIsOpen).toHaveBeenCalledWith(3);
    const untilReset = mockReset.mock.calls[0]?.[0] as {
      endType?: string;
      id?: number;
      rules?: { id: number }[];
      exceptions?: unknown[];
      until?: { date?: unknown; time?: unknown } | null;
    };
    expect(untilReset.endType).toBe('until');
    expect(untilReset.id).toBe(3);
    expect(untilReset.rules).toEqual([{ id: 9 }]);
    expect(untilReset.exceptions).toEqual([]);
    expect(typeof untilReset.until?.date).toBe('string');
    expect(typeof untilReset.until?.time).toBe('string');

    mockReset.mockClear();
    invokeButtonClick(getButtonActionByLabel(result.current, 'Edit exception'), exceptionRules[1]);
    expect(mockReset).toHaveBeenCalledWith(
      expect.objectContaining({
        endType: 'count',
        id: 4,
        until: null,
      })
    );

    mockReset.mockClear();
    invokeButtonClick(getButtonActionByLabel(result.current, 'Edit exception'), exceptionRules[2]);
    invokeButtonClick(getButtonActionByLabel(result.current, 'Edit exception'), {
      id: 99,
      rule: 'RRULE:FREQ=DAILY',
    });
    expect(mockReset).not.toHaveBeenCalled();

    invokeButtonClick(
      getButtonActionByLabel(result.current, 'Delete exception'),
      exceptionRules[0]
    );
    expect(mockSetValue).toHaveBeenCalledWith('exceptions', [exceptionRules[1], exceptionRules[2]]);
    const updater = mockSetStepData.mock.calls.at(-1)?.[0] as (prev: Record<string, unknown>) => {
      exceptions?: { exceptions?: RuleListItemType[] };
    };
    expect(updater({}).exceptions?.exceptions).toEqual([exceptionRules[1], exceptionRules[2]]);
  });
});
