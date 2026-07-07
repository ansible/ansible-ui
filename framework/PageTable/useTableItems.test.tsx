/* eslint-disable i18next/no-literal-string */
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import {
  useFiltered,
  usePaged,
  useSelected,
  useSelectedInMemory,
  useSorted,
  useTableItems,
} from './useTableItems';

interface TestItem {
  id: number;
  name: string;
}

const keyFn = (item: TestItem) => item.id;

const items: TestItem[] = [
  { id: 1, name: 'Charlie' },
  { id: 2, name: 'Alice' },
  { id: 3, name: 'Bob' },
];

describe('useSelected', () => {
  it('should initialize with empty selection', () => {
    const { result } = renderHook(() => useSelected(items, keyFn));

    expect(result.current.selectedItems).toEqual([]);
    expect(result.current.allSelected).toBe(false);
  });

  it('should initialize with defaultSelection', () => {
    const { result } = renderHook(() => useSelected(items, keyFn, [items[0], items[1]]));

    expect(result.current.selectedItems).toHaveLength(2);
    expect(result.current.isSelected(items[0])).toBe(true);
    expect(result.current.isSelected(items[1])).toBe(true);
  });

  it('should select and unselect a single item', () => {
    const { result } = renderHook(() => useSelected(items, keyFn));

    act(() => result.current.selectItem(items[0]));
    expect(result.current.selectedItems).toHaveLength(1);
    expect(result.current.isSelected(items[0])).toBe(true);

    act(() => result.current.unselectItem(items[0]));
    expect(result.current.selectedItems).toHaveLength(0);
    expect(result.current.isSelected(items[0])).toBe(false);
  });

  it('should not duplicate when selecting same item twice', () => {
    const { result } = renderHook(() => useSelected(items, keyFn));

    act(() => result.current.selectItem(items[0]));
    act(() => result.current.selectItem(items[0]));
    expect(result.current.selectedItems).toHaveLength(1);
  });

  it('should not change state when unselecting an item that is not selected', () => {
    const { result } = renderHook(() => useSelected(items, keyFn));

    act(() => result.current.unselectItem(items[0]));
    expect(result.current.selectedItems).toHaveLength(0);
  });

  it('should bulk select via selectItems', () => {
    const { result } = renderHook(() => useSelected(items, keyFn));

    act(() => result.current.selectItems([items[0], items[1]]));
    expect(result.current.selectedItems).toHaveLength(2);
  });

  it('should select all items via selectAll', () => {
    const { result } = renderHook(() => useSelected(items, keyFn));

    act(() => result.current.selectAll());
    expect(result.current.selectedItems).toHaveLength(3);
    expect(result.current.allSelected).toBe(true);
  });

  it('should unselect all items', () => {
    const { result } = renderHook(() => useSelected(items, keyFn));

    act(() => result.current.selectAll());
    expect(result.current.selectedItems).toHaveLength(3);

    act(() => result.current.unselectAll());
    expect(result.current.selectedItems).toHaveLength(0);
    expect(result.current.allSelected).toBe(false);
  });

  it('should not change state when unselectAll on empty selection', () => {
    const { result } = renderHook(() => useSelected(items, keyFn));

    const before = result.current.selectedItems;
    act(() => result.current.unselectAll());
    expect(result.current.selectedItems).toBe(before);
  });

  it('should bulk unselect via unselectItems', () => {
    const { result } = renderHook(() => useSelected(items, keyFn));

    act(() => result.current.selectAll());
    act(() => result.current.unselectItems([items[0], items[2]]));
    expect(result.current.selectedItems).toHaveLength(1);
    expect(result.current.isSelected(items[1])).toBe(true);
  });

  it('should update selected item reference when items list changes', () => {
    const initialItems = [{ id: 1, name: 'Old' }];
    const { result, rerender } = renderHook(({ items }) => useSelected(items, keyFn), {
      initialProps: { items: initialItems },
    });

    act(() => result.current.selectItem(initialItems[0]));
    expect(result.current.selectedItems[0].name).toBe('Old');

    const updatedItems = [{ id: 1, name: 'New' }];
    rerender({ items: updatedItems });
    expect(result.current.selectedItems[0].name).toBe('New');
  });

  it('should compute allSelected correctly', () => {
    const { result } = renderHook(() => useSelected(items, keyFn));

    act(() => result.current.selectItems([items[0], items[1]]));
    expect(result.current.allSelected).toBe(false);

    act(() => result.current.selectItem(items[2]));
    expect(result.current.allSelected).toBe(true);
  });
});

describe('useSelectedInMemory', () => {
  it('should initialize with empty selection', () => {
    const { result } = renderHook(() => useSelectedInMemory(items, keyFn));

    expect(result.current.selectedItems).toEqual([]);
    expect(result.current.allSelected).toBe(false);
  });

  it('should handle undefined items', () => {
    const { result } = renderHook(() => useSelectedInMemory(undefined, keyFn));

    expect(result.current.selectedItems).toEqual([]);
    expect(result.current.allSelected).toBe(false);
  });

  it('should select and unselect items', () => {
    const { result } = renderHook(() => useSelectedInMemory(items, keyFn));

    act(() => result.current.selectItem(items[0]));
    expect(result.current.isSelected(items[0])).toBe(true);

    act(() => result.current.unselectItem(items[0]));
    expect(result.current.isSelected(items[0])).toBe(false);
  });

  it('should not change state when selecting the same item reference', () => {
    const { result } = renderHook(() => useSelectedInMemory(items, keyFn));

    act(() => result.current.selectItem(items[0]));
    act(() => result.current.selectItem(items[0]));
    expect(result.current.selectedItems).toHaveLength(1);
  });

  it('should not change state when unselecting an item not in selection', () => {
    const { result } = renderHook(() => useSelectedInMemory(items, keyFn));

    act(() => result.current.unselectItem(items[0]));
    expect(result.current.selectedItems).toHaveLength(0);
  });

  it('should select all items', () => {
    const { result } = renderHook(() => useSelectedInMemory(items, keyFn));

    act(() => result.current.selectAll());
    expect(result.current.selectedItems).toHaveLength(3);
    expect(result.current.allSelected).toBe(true);
  });

  it('should select all with undefined items using empty array', () => {
    const { result } = renderHook(() => useSelectedInMemory(undefined, keyFn));

    act(() => result.current.selectAll());
    expect(result.current.selectedItems).toHaveLength(0);
  });

  it('should unselect all', () => {
    const { result } = renderHook(() => useSelectedInMemory(items, keyFn));

    act(() => result.current.selectAll());
    act(() => result.current.unselectAll());
    expect(result.current.selectedItems).toHaveLength(0);
  });

  it('should not change state when unselectAll on empty selection', () => {
    const { result } = renderHook(() => useSelectedInMemory(items, keyFn));

    const before = result.current.selectedItems;
    act(() => result.current.unselectAll());
    expect(result.current.selectedItems).toBe(before);
  });

  it('should bulk unselect via unselectItems', () => {
    const { result } = renderHook(() => useSelectedInMemory(items, keyFn));

    act(() => result.current.selectAll());
    act(() => result.current.unselectItems([items[0], items[2]]));
    expect(result.current.selectedItems).toHaveLength(1);
    expect(result.current.isSelected(items[1])).toBe(true);
  });

  it('should remove stale selections when items change', () => {
    const { result, rerender } = renderHook(({ items }) => useSelectedInMemory(items, keyFn), {
      initialProps: { items },
    });

    act(() => result.current.selectItem(items[2]));
    expect(result.current.isSelected(items[2])).toBe(true);

    rerender({ items: [items[0], items[1]] });
    expect(result.current.selectedItems).toHaveLength(0);
  });

  it('should update item reference when same key appears with new object', () => {
    const initialItems = [{ id: 1, name: 'Old' }];
    const { result, rerender } = renderHook(({ items }) => useSelectedInMemory(items, keyFn), {
      initialProps: { items: initialItems },
    });

    act(() => result.current.selectItem(initialItems[0]));
    expect(result.current.selectedItems[0].name).toBe('Old');

    const updatedItems = [{ id: 1, name: 'New' }];
    rerender({ items: updatedItems });
    expect(result.current.selectedItems[0].name).toBe('New');
  });

  it('should bulk select via selectItems', () => {
    const { result } = renderHook(() => useSelectedInMemory(items, keyFn));

    act(() => result.current.selectItems([items[0], items[1]]));
    expect(result.current.selectedItems).toHaveLength(2);
  });
});

describe('useSorted', () => {
  it('should return empty array for undefined items', () => {
    const { result } = renderHook(() => useSorted<TestItem>(undefined));

    expect(result.current.sorted).toEqual([]);
    expect(result.current.sort).toBeUndefined();
  });

  it('should pass through items when no sort is set', () => {
    const { result } = renderHook(() => useSorted(items));

    expect(result.current.sorted).toBe(items);
  });

  it('should sort ascending', () => {
    const { result } = renderHook(() => useSorted(items));

    act(() =>
      result.current.setSort({
        id: 'name',
        sortFn: (a, b) => a.name.localeCompare(b.name),
        direction: 'asc',
      })
    );

    expect(result.current.sorted.map((i) => i.name)).toEqual(['Alice', 'Bob', 'Charlie']);
  });

  it('should sort descending', () => {
    const { result } = renderHook(() => useSorted(items));

    act(() =>
      result.current.setSort({
        id: 'name',
        sortFn: (a, b) => a.name.localeCompare(b.name),
        direction: 'desc',
      })
    );

    expect(result.current.sorted.map((i) => i.name)).toEqual(['Charlie', 'Bob', 'Alice']);
  });
});

describe('useFiltered', () => {
  it('should return all items when no filterFn is set', () => {
    const { result } = renderHook(() => useFiltered(items, keyFn));

    expect(result.current.filtered).toEqual(items);
  });

  it('should filter items with a custom filterFn', () => {
    const { result } = renderHook(() => useFiltered(items, keyFn));

    act(() => result.current.setFilterFn((item: TestItem) => item.name.startsWith('A')));
    expect(result.current.filtered).toHaveLength(1);
    expect(result.current.filtered[0].name).toBe('Alice');
  });

  it('should clear filter when filterFn set to undefined', () => {
    const { result } = renderHook(() => useFiltered(items, keyFn));

    act(() => result.current.setFilterFn((item: TestItem) => item.name === 'Alice'));
    expect(result.current.filtered).toHaveLength(1);

    act(() => result.current.setFilterFn(undefined));
    expect(result.current.filtered).toEqual(items);
  });

  it('should update cache when item reference changes', () => {
    const mutableItems = [
      { id: 1, name: 'Alpha' },
      { id: 2, name: 'Beta' },
    ];
    const { result, rerender } = renderHook(({ items }) => useFiltered(items, keyFn), {
      initialProps: { items: mutableItems },
    });

    act(() => result.current.setFilterFn((item: TestItem) => item.name.startsWith('A')));
    expect(result.current.filtered).toHaveLength(1);

    const updatedItems = [
      { id: 1, name: 'Bravo' },
      { id: 2, name: 'Beta' },
    ];
    rerender({ items: updatedItems });
    expect(result.current.filtered).toHaveLength(0);
  });
});

describe('usePaged', () => {
  const manyItems: TestItem[] = Array.from({ length: 25 }, (_, i) => ({
    id: i + 1,
    name: `Item ${i + 1}`,
  }));

  it('should return first page of items', () => {
    const { result } = renderHook(() => usePaged(manyItems));

    expect(result.current.paged).toHaveLength(10);
    expect(result.current.page).toBe(1);
    expect(result.current.perPage).toBe(10);
  });

  it('should navigate to second page', () => {
    const { result } = renderHook(() => usePaged(manyItems));

    act(() => result.current.setPage(2));
    expect(result.current.paged).toHaveLength(10);
    expect(result.current.paged[0].name).toBe('Item 11');
  });

  it('should handle last page with fewer items', () => {
    const { result } = renderHook(() => usePaged(manyItems));

    act(() => result.current.setPage(3));
    expect(result.current.paged).toHaveLength(5);
    expect(result.current.paged[0].name).toBe('Item 21');
  });

  it('should change perPage', () => {
    const { result } = renderHook(() => usePaged(manyItems));

    act(() => result.current.setPerPage(5));
    expect(result.current.paged).toHaveLength(5);
    expect(result.current.perPage).toBe(5);
  });

  it('should reset to page 1 when current page exceeds total pages', () => {
    const { result } = renderHook(() => usePaged(manyItems));

    act(() => result.current.setPage(3));
    expect(result.current.page).toBe(3);

    act(() => result.current.setPerPage(25));
    expect(result.current.page).toBe(1);
  });

  it('should preserve array reference when slice is unchanged', () => {
    const { result, rerender } = renderHook(({ source }) => usePaged(source), {
      initialProps: { source: manyItems },
    });
    const firstPaged = result.current.paged;

    rerender({ source: manyItems });
    expect(result.current.paged).toBe(firstPaged);
  });
});

describe('useTableItems (integration)', () => {
  it('should expose all composed hooks', () => {
    const { result } = renderHook(() => useTableItems(items, keyFn));

    expect(result.current.selectedItems).toEqual([]);
    expect(result.current.sorted).toEqual(items);
    expect(result.current.filtered).toBeDefined();
    expect(result.current.searched).toBeDefined();
    expect(result.current.paged).toBeDefined();
    expect(result.current.page).toBe(1);
    expect(result.current.perPage).toBe(10);
  });

  it('should pipe items through sort → filter → search → page', () => {
    const { result } = renderHook(() => useTableItems(items, keyFn));

    act(() =>
      result.current.setSort({
        id: 'name',
        sortFn: (a, b) => a.name.localeCompare(b.name),
        direction: 'asc',
      })
    );
    expect(result.current.sorted.map((i) => i.name)).toEqual(['Alice', 'Bob', 'Charlie']);

    act(() => result.current.setFilterFn((item: TestItem) => item.name !== 'Bob'));
    expect(result.current.filtered).toHaveLength(2);
  });

  it('should select page of items', () => {
    const manyItems: TestItem[] = Array.from({ length: 25 }, (_, i) => ({
      id: i + 1,
      name: `Item ${i + 1}`,
    }));
    const { result } = renderHook(() => useTableItems(manyItems, keyFn));

    act(() => result.current.selectPage());
    expect(result.current.selectedItems).toHaveLength(10);
  });

  it('should select all searched items', () => {
    const { result } = renderHook(() => useTableItems(items, keyFn));

    act(() => result.current.selectAll());
    expect(result.current.selectedItems).toHaveLength(3);
    expect(result.current.allSelected).toBe(true);
  });

  it('should initialize search from defaults', () => {
    const { result } = renderHook(() => useTableItems(items, keyFn, { search: 'test' }));

    expect(result.current.search).toBe('test');
  });

  it('should debounce search updates', () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useTableItems(items, keyFn));

    act(() => result.current.setSearch('hello'));
    expect(result.current.search).toBe('');

    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(result.current.search).toBe('hello');

    vi.useRealTimers();
  });

  it('should filter and rank items by search score', () => {
    const { result } = renderHook(() => useTableItems(items, keyFn));

    act(() =>
      result.current.setSearchFn((item: TestItem, search: string) => {
        if (item.name.toLowerCase().includes(search.toLowerCase())) return 0;
        return 1;
      })
    );

    vi.useFakeTimers();
    act(() => result.current.setSearch('alice'));
    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(result.current.searched).toHaveLength(1);
    expect(result.current.searched[0].name).toBe('Alice');

    vi.useRealTimers();
  });

  it('should show all items when search is empty', () => {
    const { result } = renderHook(() => useTableItems(items, keyFn));

    act(() =>
      result.current.setSearchFn((item: TestItem, search: string) => {
        if (item.name.toLowerCase().includes(search.toLowerCase())) return 0;
        return 1;
      })
    );

    expect(result.current.searched).toHaveLength(3);
  });
});
