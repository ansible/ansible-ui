import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useColumns } from './useInventorySelector';
import type { Inventory } from '../../../../interfaces/Inventory';

vi.mock('../../../../common/useAwxView', () => ({
  useAwxView: vi.fn(),
}));

vi.mock('../../hooks/useInventoriesColumns', () => ({
  useInventoriesColumns: vi.fn(() => []),
}));

vi.mock('../../hooks/useInventoriesFilters', () => ({
  useInventoriesFilters: vi.fn(() => []),
}));

describe('useColumns', () => {
  it('should return a single Name column', () => {
    const { result } = renderHook(() => useColumns());

    expect(result.current).toHaveLength(1);
    expect(result.current[0].header).toBe('Name');
  });

  it('should extract inventory name via value accessor', () => {
    const { result } = renderHook(() => useColumns());
    const column = result.current[0];

    const inventory = { id: 1, name: 'My Inventory' };
    expect(column.value?.(inventory as unknown as Inventory)).toBe('My Inventory');
  });

  it('should return stable reference across re-renders', () => {
    const { result, rerender } = renderHook(() => useColumns());
    const first = result.current;
    rerender();
    expect(result.current).toBe(first);
  });
});
