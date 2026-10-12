import { renderHook } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, test } from 'vitest';
import { useExecutionEnvironmentsColumns } from './useExecutionEnvironmentsColumns';

describe('useExecutionEnvironmentsColumns', () => {
  test('returns table columns for execution environments', () => {
    const { result } = renderHook(() => useExecutionEnvironmentsColumns(), {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    });

    expect(result.current.map((column) => column.header)).toEqual([
      'ID',
      'Name',
      'Description',
      'Image',
      'Organization',
      'Created',
      'Last modified',
    ]);
  });
});
