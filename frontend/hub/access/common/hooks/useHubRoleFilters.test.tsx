import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useHubRoleFilters } from './useHubRoleFilters';

describe('useHubRoleFilters', () => {
  it('returns name filter configuration', () => {
    const { result } = renderHook(() => useHubRoleFilters());

    expect(result.current).toHaveLength(1);
    expect(result.current[0]).toMatchObject({
      key: 'name',
      label: 'Name',
      query: 'name__icontains',
    });
  });
});
