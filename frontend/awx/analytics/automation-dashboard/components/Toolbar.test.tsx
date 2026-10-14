/* eslint-disable i18next/no-literal-string */
import { renderHook } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { useAutomationDashboardPeriodFilter, useAutomationDashboardToolbar } from './Toolbar';
import { ToolbarFilterType } from '@ansible/ansible-ui-framework';
import { AutomationDashboardDateRangeFilterPresets } from '../constants';

describe('useAutomationDashboardToolbar', () => {
  test('should return exactly 4 filters', () => {
    const { result } = renderHook(() => useAutomationDashboardToolbar());
    expect(result.current).toHaveLength(4);
  });

  test('should include all expected filter keys but not the period', () => {
    const { result } = renderHook(() => useAutomationDashboardToolbar());
    const keys = result.current.map((f) => f.key);
    expect(keys).toEqual(['template', 'label', 'organization', 'project']);
    expect(keys).not.toContain('period');
  });

  test('should return a stable filter list across re-renders', () => {
    const { result, rerender } = renderHook(() => useAutomationDashboardToolbar());
    const first = result.current;
    rerender();
    expect(result.current).toBe(first);
  });
});

describe('useAutomationDashboardPeriodFilter', () => {
  test('should have period filter with correct type and query', () => {
    const { result } = renderHook(() => useAutomationDashboardPeriodFilter());
    expect(result.current.key).toBe('period');
    expect(result.current.type).toBe(ToolbarFilterType.DateRange);
    expect(result.current.label).toBe('Period');
    expect(result.current.query).toBe('period');
  });

  test('should have period filter required with last 7 days as default', () => {
    const { result } = renderHook(() => useAutomationDashboardPeriodFilter());
    expect(result.current.isRequired).toBe(true);
    expect(result.current.defaultValue).toBe(AutomationDashboardDateRangeFilterPresets.last_7_days);
  });

  test('should have period filter with all 5 presets and Custom', () => {
    const { result } = renderHook(() => useAutomationDashboardPeriodFilter());
    expect(result.current.options.map((o) => o.value)).toEqual([
      AutomationDashboardDateRangeFilterPresets.last_7_days,
      AutomationDashboardDateRangeFilterPresets.last_14_days,
      AutomationDashboardDateRangeFilterPresets.last_30_days,
      AutomationDashboardDateRangeFilterPresets.last_60_days,
      AutomationDashboardDateRangeFilterPresets.last_90_days,
      AutomationDashboardDateRangeFilterPresets.custom,
    ]);
    expect(result.current.options.at(-1)?.isCustom).toBe(true);
  });
});
