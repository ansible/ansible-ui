import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useOrganizationFilters } from './useOrganizationFilters';

describe('useOrganizationFilters', () => {
  it('should return toolbar filters array', () => {
    const { result } = renderHook(() => useOrganizationFilters());

    expect(result.current).toBeDefined();
    expect(Array.isArray(result.current)).toBe(true);
  });

  it('should include name filter', () => {
    const { result } = renderHook(() => useOrganizationFilters());

    expect(result.current.length).toBeGreaterThan(0);
    const nameFilter = result.current.find((filter) => filter.key === 'name');
    expect(nameFilter).toBeDefined();
  });

  it('should return at least one filter', () => {
    const { result } = renderHook(() => useOrganizationFilters());

    expect(result.current.length).toBeGreaterThan(0);
  });
});
