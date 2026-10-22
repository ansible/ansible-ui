import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useManageHubDashboard } from './useManageHubDashboard';

describe('useManageHubDashboard', () => {
  it('returns manage dashboard helpers', () => {
    const { result } = renderHook(() => useManageHubDashboard());

    expect(result.current.openManageDashboard).toBeTypeOf('function');
    expect(Array.isArray(result.current.managedCategories)).toBe(true);
    expect(result.current.managedCategories.length).toBeGreaterThan(0);
  });
});
