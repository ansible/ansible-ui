import { describe, expect, it } from 'vitest';
import { TAGS, TagName, perPageOptions } from './constants';

describe('Reports constants', () => {
  it('defines a tag entry for each TagName value', () => {
    const tagKeys = TAGS.map((tag) => tag.key);
    expect(tagKeys).toContain(TagName.operations);
    expect(tagKeys).toContain(TagName.savings);
    expect(TAGS.length).toBe(Object.keys(TagName).length);
  });

  it('exposes per-page options for report tables', () => {
    expect(perPageOptions.map((o) => o.value)).toEqual([4, 6, 8, 10]);
  });
});
