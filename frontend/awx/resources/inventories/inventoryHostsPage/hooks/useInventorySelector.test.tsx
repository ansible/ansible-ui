import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useAsyncSingleSelectFilterBuilder } from '@ansible/hub-ui/common/ToolbarAsyncSelectFilterBuilder';
import type { ITableColumn } from '@ansible/ansible-ui-framework';
import { useColumns, useSelectInventorySingle } from './useInventorySelector';
import type { Inventory } from '../../../../interfaces/Inventory';

const mockOpenBrowse = vi.fn();

vi.mock('@ansible/hub-ui/common/ToolbarAsyncSelectFilterBuilder', () => ({
  useAsyncSingleSelectFilterBuilder: vi.fn(() => ({ openBrowse: mockOpenBrowse })),
}));

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

  it('should render inventory name via value accessor for sorting', () => {
    const { result } = renderHook(() => useColumns());
    const column = result.current[0] as ITableColumn<Inventory>;
    expect(column.sort).toBeUndefined();
    expect(column.value?.({ id: 9, name: 'Sorted Name' } as Inventory)).toBe('Sorted Name');
  });
});

describe('useSelectInventorySingle', () => {
  it('wires inventory list view params and exposes openBrowse', () => {
    const { result } = renderHook(() => useSelectInventorySingle({ organization: ['1'] }));

    expect(result.current.openBrowse).toBe(mockOpenBrowse);
    const config = vi
      .mocked(useAsyncSingleSelectFilterBuilder)
      .mock.calls.at(-1)?.[0] as unknown as {
      title: string;
      viewParams: {
        url: string;
        queryParams: { organization: string[] };
        keyFn: (item: Inventory) => string;
      };
    };
    const titleText = Array.isArray(config.title) ? config.title.join('') : String(config.title);
    expect(titleText).toContain('Select Inventory');
    expect(config.viewParams.url).toContain('/inventories/');
    expect(config.viewParams.queryParams).toEqual({ organization: ['1'] });
    expect(config.viewParams.keyFn({ name: 'demo' } as Inventory)).toBe('demo');
  });
});
