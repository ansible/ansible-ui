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
