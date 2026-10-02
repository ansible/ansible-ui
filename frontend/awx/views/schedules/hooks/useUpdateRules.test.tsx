import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { RuleListItemType } from '../types';
import { useUpdateRules } from './useUpdateRules';

vi.mock('@ansible/ansible-ui-framework/PageWizard/PageWizardProvider', () => ({
  usePageWizard: () => ({
    wizardData: {
      timezone: 'America/New_York',
      startDateTime: { date: '2026-06-20', time: '10:00 AM' },
    },
  }),
}));

vi.mock('./useGet24HourTime', () => ({
  useGet24HourTime: () => () => ({ hour: 10, minute: 0 }),
}));

describe('useUpdateRules', () => {
  it('should add Z suffix to UNTIL when rrule library omits it during serialization', () => {
    const { result } = renderHook(() => useUpdateRules());
    const rules: RuleListItemType[] = [
      {
        id: 1,
        rule: 'DTSTART;TZID=America/New_York:20260620T100000\nRRULE:FREQ=HOURLY;INTERVAL=1;UNTIL=20260620T200000Z',
      },
    ];

    const updated = result.current(rules);

    expect(updated[0].rule).toMatch(/UNTIL=\d{8}T\d{6}Z/);
    expect(updated[0].rule).not.toMatch(/UNTIL=\d{8}T\d{6}[^Z]/);
  });

  it('should return the same array reference when no rules are changed', () => {
    const { result } = renderHook(() => useUpdateRules());
    const rules: RuleListItemType[] = [];

    const updated = result.current(rules);

    expect(updated).toBe(rules);
  });

  it('should return a new array reference when rules are updated', () => {
    const { result } = renderHook(() => useUpdateRules());
    const rules: RuleListItemType[] = [{ id: 1, rule: 'RRULE:FREQ=HOURLY;INTERVAL=1' }];

    const updated = result.current(rules);

    expect(updated).not.toBe(rules);
    expect(updated.length).toBe(1);
  });

  it('should preserve rule id when updating', () => {
    const { result } = renderHook(() => useUpdateRules());
    const rules: RuleListItemType[] = [{ id: 42, rule: 'RRULE:FREQ=DAILY;INTERVAL=1' }];

    const updated = result.current(rules);

    expect(updated[0].id).toBe(42);
  });
});
