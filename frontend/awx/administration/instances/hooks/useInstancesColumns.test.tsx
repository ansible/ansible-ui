import { renderHook } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, test } from 'vitest';
import { useInstancesColumns } from './useInstancesColumns';

describe('useInstancesColumns', () => {
  test('returns instance table columns', () => {
    const { result } = renderHook(() => useInstancesColumns(), {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    });

    expect(result.current.map((column) => column.header)).toEqual([
      'Name',
      'Status',
      'Node type',
      'Capacity adjustment',
      'Used capacity',
      'Running jobs',
      'Total jobs',
      'Memory',
      'Policy type',
      'Created',
      'Last modified',
    ]);
  });
});
