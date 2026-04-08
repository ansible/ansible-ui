/* eslint-disable i18next/no-literal-string */
import { renderHook } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { useAutomationDashboardToolbar } from './Toolbar';
import { IToolbarSingleSelectFilter, ToolbarFilterType } from '@ansible/ansible-ui-framework';
import { AutomationDashboardDateRangeFilterPresets } from '../constants';

type PeriodFilter = IToolbarSingleSelectFilter;

function getPeriodFilter(filters: ReturnType<typeof useAutomationDashboardToolbar>): PeriodFilter {
  const period = filters.find((f): f is PeriodFilter => f.key === 'period');
  expect(period).toBeDefined();
  return period!;
}

describe('useAutomationDashboardToolbar', () => {
  test('should return exactly 5 filters', () => {
    const { result } = renderHook(() => useAutomationDashboardToolbar());
    expect(result.current).toHaveLength(5);
  });

  test('should include all expected filter keys', () => {
    const { result } = renderHook(() => useAutomationDashboardToolbar());
    const keys = result.current.map((f) => f.key);
    expect(keys).toContain('template');
    expect(keys).toContain('label');
    expect(keys).toContain('organization');
    expect(keys).toContain('project');
    expect(keys).toContain('period');
  });

  test('should have period filter with correct type and query', () => {
    const { result } = renderHook(() => useAutomationDashboardToolbar());
    const period = getPeriodFilter(result.current);
    expect(period.type).toBe(ToolbarFilterType.SingleSelect);
    expect(period.label).toBe('Period');
    expect(period.query).toBe('period');
  });

  test('should have period filter pinned, required, and with sort disabled', () => {
    const { result } = renderHook(() => useAutomationDashboardToolbar());
    const period = getPeriodFilter(result.current);
    expect(period.isPinned).toBe(true);
    expect(period.isRequired).toBe(true);
    expect(period.disableSortOptions).toBe(true);
  });

  test('should have period filter with all 5 date range options', () => {
    const { result } = renderHook(() => useAutomationDashboardToolbar());
    const period = getPeriodFilter(result.current);
    expect(period.options).toHaveLength(5);
    const values = period.options.map((o) => o.value);
    expect(values).toContain(AutomationDashboardDateRangeFilterPresets.last_7_days);
    expect(values).toContain(AutomationDashboardDateRangeFilterPresets.last_14_days);
    expect(values).toContain(AutomationDashboardDateRangeFilterPresets.last_30_days);
    expect(values).toContain(AutomationDashboardDateRangeFilterPresets.last_60_days);
    expect(values).toContain(AutomationDashboardDateRangeFilterPresets.last_90_days);
  });
});
