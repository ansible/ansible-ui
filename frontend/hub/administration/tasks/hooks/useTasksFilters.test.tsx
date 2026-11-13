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
    expect(result.current[1]).toEqual(
      expect.objectContaining({
        options: expect.arrayContaining([
          { label: 'Completed', value: 'completed' },
          { label: 'Failed', value: 'failed' },
          { label: 'Running', value: 'running' },
          { label: 'Waiting', value: 'waiting' },
          { label: 'Canceled', value: 'canceled' },
        ]),
      })
    );
  });
});
