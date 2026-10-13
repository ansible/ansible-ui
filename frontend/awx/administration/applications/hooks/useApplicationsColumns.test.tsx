import { renderHook } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, test } from 'vitest';
import { useApplicationsColumns } from './useApplicationsColumns';

describe('useApplicationsColumns', () => {
  test('returns application table columns', () => {
    const { result } = renderHook(() => useApplicationsColumns(), {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    });

    expect(result.current.map((column) => column.header)).toEqual([
      'Name',
      'Description',
      'Organization',
      'Created',
      'Last modified',
    ]);
  });
});
