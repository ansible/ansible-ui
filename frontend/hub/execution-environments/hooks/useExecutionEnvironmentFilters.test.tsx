/* eslint-disable i18next/no-literal-string */
import { renderHook } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { useExecutionEnvironmentFilters } from './useExecutionEnvironmentFilters';

describe('useExecutionEnvironmentFilters', () => {
  it('returns name filter with expected query', () => {
    const { result } = renderHook(() => useExecutionEnvironmentFilters(), {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    });

    expect(result.current).toHaveLength(1);
    expect(result.current[0].key).toBe('name');
    expect(result.current[0].query).toBe('name__icontains');
  });
});
