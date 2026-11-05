import { describe, expect, it } from 'vitest';
import { getAddedAndRemoved } from './getAddedAndRemoved';

describe('getAddedAndRemoved', () => {
  it('detects added and removed items by id', () => {
    const original = [
      { id: 1, name: 'a' },
      { id: 2, name: 'b' },
    ];
    const current = [
      { id: 2, name: 'b' },
      { id: 3, name: 'c' },
    ];
    const { added, removed } = getAddedAndRemoved(original, current);
    expect(removed).toEqual([{ id: 1, name: 'a' }]);
    expect(added).toEqual([{ id: 3, name: 'c' }]);
  });

  it('handles empty and undefined lists', () => {
    expect(getAddedAndRemoved([], [])).toEqual({ added: [], removed: [] });
    expect(getAddedAndRemoved(undefined as unknown as [], undefined as unknown as [])).toEqual({
      added: [],
      removed: [],
    });
  });
});
