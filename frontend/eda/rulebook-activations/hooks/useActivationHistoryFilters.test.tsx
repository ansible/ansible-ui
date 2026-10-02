/* eslint-disable i18next/no-literal-string */
import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { IToolbarFilter, ToolbarFilterType } from '@ansible/ansible-ui-framework';
import { useActivationHistoryFilters } from './useActivationHistoryFilters';

describe('useActivationHistoryFilters', () => {
  it('should return an array of toolbar filters', () => {
    const { result } = renderHook(() => useActivationHistoryFilters());
    expect(result.current).toBeInstanceOf(Array);
    expect(result.current.length).toBe(1);
  });

  it('should have a status filter', () => {
    const { result } = renderHook(() => useActivationHistoryFilters());
    const statusFilter = result.current[0];
    expect(statusFilter.key).toBe('status');
    expect(statusFilter.label).toBe('Status');
    expect(statusFilter.type).toBe(ToolbarFilterType.MultiSelect);
    expect(statusFilter.query).toBe('status');
  });

  it('should have all expected status options', () => {
    const { result } = renderHook(() => useActivationHistoryFilters());
    const statusFilter = result.current[0] as IToolbarFilter & {
      options?: { label: string; value: string }[];
    };
    const options = statusFilter.options ?? [];

    expect(options).toHaveLength(8);

    const expectedValues = [
      'starting',
      'running',
      'pending',
      'failed',
      'stopping',
      'stopped',
      'completed',
      'unresponsive',
    ];
    const optionValues = options.map((opt: { value: string }) => opt.value);
    expect(optionValues).toEqual(expectedValues);
  });

  it('should have translated labels for each status option', () => {
    const { result } = renderHook(() => useActivationHistoryFilters());
    const statusFilter = result.current[0] as IToolbarFilter & {
      options?: { label: string; value: string }[];
    };
    const options = statusFilter.options ?? [];

    const expectedLabels = [
      'Starting',
      'Running',
      'Pending',
      'Failed',
      'Stopping',
      'Stopped',
      'Completed',
      'Unresponsive',
    ];
    const optionLabels = options.map((opt: { label: string }) => opt.label);
    expect(optionLabels).toEqual(expectedLabels);
  });

  it('should have a placeholder for select statuses', () => {
    const { result } = renderHook(() => useActivationHistoryFilters());
    const statusFilter = result.current[0];
    expect(statusFilter.placeholder).toBe('Select statuses');
  });
});
