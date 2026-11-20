import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useTasksFilters } from './useTasksFilters';

describe('useTasksFilters', () => {
  it('maps task name filter to exact-match name query (Pulp does not support contains)', () => {
    const { result } = renderHook(() => useTasksFilters());

    expect(result.current[0]).toMatchObject({
      key: 'name',
      label: 'Task name',
      query: 'name',
      comparison: 'equals',
    });
  });

  it('includes status filter options', () => {
    const { result } = renderHook(() => useTasksFilters());

    expect(result.current[1]).toMatchObject({
      key: 'status',
      label: 'Status',
      query: 'state',
    });

    const statusFilter = result.current[1];
    expect(statusFilter && 'options' in statusFilter && statusFilter.options).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ value: 'completed' }),
        expect.objectContaining({ value: 'failed' }),
        expect.objectContaining({ value: 'running' }),
        expect.objectContaining({ value: 'waiting' }),
        expect.objectContaining({ value: 'canceled' }),
      ])
    );
  });
});
