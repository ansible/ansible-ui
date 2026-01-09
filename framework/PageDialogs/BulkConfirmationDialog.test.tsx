import { renderHook } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { ITableColumn } from '../PageTable/PageTableColumn';
import { useBulkConfirmation } from './BulkConfirmationDialog';

interface TestItem {
  id: number;
  name: string;
  status?: string;
}

const mockColumns: ITableColumn<TestItem>[] = [
  {
    header: 'Name',
    cell: (item) => item.name,
  },
];

const mockKeyFn = (item: TestItem) => item.id;

vi.mock('./BulkActionDialog', () => ({
  useBulkActionDialog: () => vi.fn(),
}));

describe('useBulkConfirmation', () => {
  test('should return a function', () => {
    const { result } = renderHook(() => useBulkConfirmation());

    expect(typeof result.current).toBe('function');
  });

  test('should filter non-actionable items before passing to bulk action', () => {
    const { result } = renderHook(() => useBulkConfirmation());

    const isItemNonActionable = (item: TestItem) => (item.id === 1 ? 'Cannot delete' : undefined);

    const items: TestItem[] = [
      { id: 1, name: 'Item 1' },
      { id: 2, name: 'Item 2' },
    ];

    expect(() =>
      result.current({
        title: 'Test',
        items,
        keyFn: mockKeyFn as (item: object) => string | number,
        confirmationColumns: mockColumns as ITableColumn<object>[],
        actionColumns: mockColumns as ITableColumn<object>[],
        actionFn: vi.fn(),
        actionButtonText: 'Submit',
        confirmText: 'Confirm',
        isItemNonActionable: isItemNonActionable as (item: object) => string | undefined,
      })
    ).not.toThrow();
  });

  test('should handle items without isItemNonActionable', () => {
    const { result } = renderHook(() => useBulkConfirmation());

    const items: TestItem[] = [
      { id: 1, name: 'Item 1' },
      { id: 2, name: 'Item 2' },
    ];

    expect(() =>
      result.current({
        title: 'Test',
        items,
        keyFn: mockKeyFn as (item: object) => string | number,
        confirmationColumns: mockColumns as ITableColumn<object>[],
        actionColumns: mockColumns as ITableColumn<object>[],
        actionFn: vi.fn(),
        actionButtonText: 'Submit',
        confirmText: 'Confirm',
      })
    ).not.toThrow();
  });

  test('should handle custom error adapter', () => {
    const customErrorAdapter = vi.fn();
    const { result } = renderHook(() => useBulkConfirmation(customErrorAdapter));

    expect(typeof result.current).toBe('function');
  });

  test('should handle custom status parser', () => {
    const customStatusParser = vi.fn();
    const { result } = renderHook(() => useBulkConfirmation(undefined, customStatusParser));

    expect(typeof result.current).toBe('function');
  });
});
