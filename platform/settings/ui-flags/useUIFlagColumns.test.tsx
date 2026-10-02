import { renderHook } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { UIFlag } from './IUIFlag';
import { useUIFlagColumns } from './useUIFlagColumns';

describe('useUIFlagColumns', () => {
  test('should define name, description, and status columns', () => {
    const { result } = renderHook(() => useUIFlagColumns());

    expect(result.current.map((column) => column.id)).toEqual(['name', 'description', 'status']);
  });

  test('should map status values for alpha, beta, and production flags', () => {
    const { result } = renderHook(() => useUIFlagColumns());
    const statusColumn = result.current.find((column) => column.id === 'status');

    const alphaFlag = {
      id: UIFlag.PersonaViewSwitcher,
      name: 'Alpha flag',
      description: 'desc',
      enabled: false,
      status: 'alpha' as const,
    };

    expect(statusColumn?.value?.(alphaFlag)).toEqual(['Alpha']);
    expect(statusColumn?.value?.({ ...alphaFlag, status: 'beta' })).toEqual(['Beta']);
    expect(statusColumn?.value?.({ ...alphaFlag, status: 'production' })).toEqual(['Production']);
  });
});
