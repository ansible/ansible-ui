import { fireEvent, render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { moveItem, ReorderItems } from './ReorderItems';

describe('ReorderItems', () => {
  it('leaves the list unchanged when the item is missing or already positioned', () => {
    const items = [{ id: 'first' }, { id: 'second' }];

    expect(moveItem([...items], 'missing', 1, (item) => item.id)).toEqual(items);
    expect(moveItem([...items], 'first', 0, (item) => item.id)).toEqual(items);
  });

  it('does not insert an undefined item from a sparse list', () => {
    const items = [undefined, { id: 'second' }] as unknown as { id: string }[];

    expect(moveItem([...items], 'missing', 1, (item) => item?.id ?? 'missing')).toEqual([items[1]]);
  });

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
