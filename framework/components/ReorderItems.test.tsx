import { describe, expect, it } from 'vitest';
import { moveReorderItem } from './ReorderItems';

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
});
