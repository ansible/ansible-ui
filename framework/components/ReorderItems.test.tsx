import { fireEvent, render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { moveReorderItem, ReorderItems } from './ReorderItems';

describe('moveReorderItem', () => {
  it('moves an item to the target index', () => {
    const items = [{ id: 'first' }, { id: 'second' }];
    const reordered = moveReorderItem(items, 'first', 1, (item) => item.id);

    expect(reordered).toEqual([{ id: 'second' }, { id: 'first' }]);
  });

  it('returns the original array when the item is already at the target index', () => {
    const items = [{ id: 'first' }, { id: 'second' }];
    const reordered = moveReorderItem(items, 'first', 0, (item) => item.id);

    expect(reordered).toEqual(items);
  });

  it('returns the original array when the item is not found', () => {
    const items = [{ id: 'first' }, { id: 'second' }];
    const reordered = moveReorderItem(items, 'missing', 1, (item) => item.id);

    expect(reordered).toBe(items);
  });

  it('does not insert an unavailable item after removing it', () => {
    const items = [undefined];
    const reordered = moveReorderItem(items, 'missing', 1, () => 'missing');

    expect(reordered).toEqual([]);
  });

  it('moves falsy items instead of treating them as missing', () => {
    const items = [0, 1];
    const reordered = moveReorderItem(items, 0, 1, (item) => item);

    expect(reordered).toEqual([1, 0]);
  });
});

describe('ReorderItems', () => {
  it('moves a dragged item to the target row', () => {
    const items = [{ id: 'first' }, { id: 'second' }];
    const setItems = vi.fn();
    const { container } = render(
      <ReorderItems
        columns={[{ header: 'ID', cell: (item) => item.id }]}
        items={items}
        setItems={setItems}
        keyFn={(item) => item.id}
        isSelected={() => false}
        selectItem={vi.fn()}
        unselectItem={vi.fn()}
        allSelected={false}
        selectAll={vi.fn()}
        unselectAll={vi.fn()}
      />
    );
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
      x: 0,
      y: 0,
      width: 100,
      height: 100,
      top: 0,
      right: 100,
      bottom: 100,
      left: 0,
      toJSON: () => ({}),
    });

    const rows = container.querySelectorAll('tbody tr');
    const dataTransfer = { effectAllowed: '' };
    fireEvent.dragStart(rows[0], { dataTransfer });
    fireEvent.dragOver(rows[1], { clientX: 50, clientY: 50 });

    expect(setItems).toHaveBeenCalledWith([items[1], items[0]]);
  });

  it('moves an item down when the target row follows it', () => {
    const items = [{ id: 'first' }, { id: 'second' }, { id: 'third' }];
    const setItems = vi.fn();
    const { container } = render(
      <ReorderItems
        columns={[{ header: 'ID', cell: (item) => item.id }]}
        items={items}
        setItems={setItems}
        keyFn={(item) => item.id}
        isSelected={() => false}
        selectItem={vi.fn()}
        unselectItem={vi.fn()}
        allSelected={false}
        selectAll={vi.fn()}
        unselectAll={vi.fn()}
      />
    );
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
      x: 0,
      y: 0,
      width: 100,
      height: 100,
      top: 0,
      right: 100,
      bottom: 100,
      left: 0,
      toJSON: () => ({}),
    });

    const rows = container.querySelectorAll('tbody tr');
    fireEvent.dragStart(rows[1], { dataTransfer: { effectAllowed: '' } });
    fireEvent.dragOver(rows[2], { clientX: 50, clientY: 50 });

    expect(setItems).toHaveBeenCalledWith([items[0], items[2], items[1]]);
  });
});
