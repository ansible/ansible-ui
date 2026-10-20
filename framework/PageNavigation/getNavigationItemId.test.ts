import { describe, expect, it } from 'vitest';
import type { PageNavigationItem } from './PageNavigationItem';
import { getNavigationItemId } from './getNavigationItemId';

const stub = null as unknown as JSX.Element;

describe('getNavigationItemId', () => {
  it('falls back to the label when the item id is empty', () => {
    const item: PageNavigationItem = {
      id: '',
      label: 'Empty id item',
      path: '/empty-id',
      element: stub,
    };

    expect(getNavigationItemId(item)).toBe('empty-id-item');
  });
});
