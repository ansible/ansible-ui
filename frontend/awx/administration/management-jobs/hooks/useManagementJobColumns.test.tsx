import { renderHook } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, test } from 'vitest';
import { useManagementJobColumns } from './useManagementJobColumns';

describe('useManagementJobColumns', () => {
  test('returns management job table columns', () => {
    const { result } = renderHook(() => useManagementJobColumns(), {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    });

    expect(result.current.map((column) => column.header)).toEqual(['Name', 'Description']);
  });
});
