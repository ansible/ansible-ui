import { renderHook } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, test } from 'vitest';
import { useNotifiersColumns } from './useNotifiersColumns';

describe('useNotifiersColumns', () => {
  test('returns table columns for notification templates', () => {
    const { result } = renderHook(() => useNotifiersColumns(), {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    });

    expect(result.current.map((column) => column.header)).toEqual([
      'Name',
      'Status',
      'Type',
      'Organization',
    ]);
  });
});
