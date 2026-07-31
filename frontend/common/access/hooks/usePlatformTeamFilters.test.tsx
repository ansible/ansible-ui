/* eslint-disable i18next/no-literal-string */
import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { usePlatformTeamFilters } from './usePlatformTeamFilters';

describe('usePlatformTeamFilters', () => {
  it('should return an array of toolbar filters', () => {
    const { result } = renderHook(() => usePlatformTeamFilters());
    expect(result.current).toHaveLength(1);
  });

  it('should include a name filter', () => {
    const { result } = renderHook(() => usePlatformTeamFilters());
    const nameFilter = result.current[0];

    expect(nameFilter.key).toBe('name');
    expect(nameFilter.label).toBe('Name');
    expect(nameFilter.query).toBe('name');
    expect(nameFilter.comparison).toBe('startsWith');
  });
});
