import { fireEvent, render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ReorderItems } from './ReorderItems';

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
});
