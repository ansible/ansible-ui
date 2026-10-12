import { renderHook } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, test } from 'vitest';
import { useInstanceGroupsColumns } from './useInstanceGroupColumns';

describe('useInstanceGroupsColumns', () => {
  test('returns table columns for instance groups', () => {
    const { result } = renderHook(() => useInstanceGroupsColumns(), {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    });

    expect(result.current.map((column) => column.header)).toEqual([
      'Name',
      'Type',
      'Running jobs',
      'Total jobs',
      'Instances',
      'Used capacity',
      'Created',
      'Last modified',
    ]);
  });
});
