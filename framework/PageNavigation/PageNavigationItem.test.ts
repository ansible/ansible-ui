/* eslint-disable i18next/no-literal-string */
import { describe, expect, it } from 'vitest';
import {
  addNavigationItem,
  addNavigationItemAfter,
  addNavigationItemBefore,
  findNavigationItemById,
  type PageNavigationItem,
  removeLeadingSlash,
  removeNavigationItemById,
} from './PageNavigationItem';

describe('removeLeadingSlash', () => {
  it('should remove the leading slash', () => {
    expect(removeLeadingSlash('/foo/bar')).toBe('foo/bar');
  });

  it('should return the string unchanged when there is no leading slash', () => {
    expect(removeLeadingSlash('foo/bar')).toBe('foo/bar');
  });

  it('should return an empty string when given only a slash', () => {
    expect(removeLeadingSlash('/')).toBe('');
  });
});

const stub = null as unknown as JSX.Element;

function makeItems(): PageNavigationItem[] {
  return [
    {
      id: 'a',
      path: '/a',
      children: [
        { id: 'a1', path: '/a/1', element: stub },
        { id: 'a2', path: '/a/2', element: stub },
      ],
    },
    { id: 'b', path: '/b', element: stub },
  ];
}

describe('findNavigationItemById', () => {
  it('should find an item at the root level', () => {
    const items = makeItems();
    const result = findNavigationItemById(items, 'b');
    expect(result).toBeDefined();
    expect(result?.id).toBe('b');
  });

  it('should find an item nested in children', () => {
    const items = makeItems();
    const result = findNavigationItemById(items, 'a1');
    expect(result).toBeDefined();
    expect(result?.id).toBe('a1');
  });

  it('should return undefined when the id does not exist', () => {
    const items = makeItems();
    expect(findNavigationItemById(items, 'nonexistent')).toBeUndefined();
  });
});

describe('removeNavigationItemById', () => {
  it('should remove and return a root-level item', () => {
    const items = makeItems();
    const removed = removeNavigationItemById(items, 'b');

    expect(removed).toBeDefined();
    expect(removed?.id).toBe('b');
    expect(items).toHaveLength(1);
  });

  it('should remove and return a nested item', () => {
    const items = makeItems();
    const removed = removeNavigationItemById(items, 'a1');

    expect(removed).toBeDefined();
    expect(removed?.id).toBe('a1');
    const parent = items[0] as PageNavigationItem & { children: PageNavigationItem[] };
    expect(parent.children).toHaveLength(1);
    expect(parent.children[0].id).toBe('a2');
  });

  it('should return undefined when the id does not exist', () => {
    const items = makeItems();
    expect(removeNavigationItemById(items, 'nonexistent')).toBeUndefined();
    expect(items).toHaveLength(2);
  });
});

describe('addNavigationItem', () => {
  it('should add a child to an existing group', () => {
    const items = makeItems();
    const newItem: PageNavigationItem = { id: 'a3', path: '/a/3', element: stub };

    addNavigationItem(items, 'a', newItem);

    const parent = items[0] as PageNavigationItem & { children: PageNavigationItem[] };
    expect(parent.children).toHaveLength(3);
    expect(parent.children[2].id).toBe('a3');
  });

  it('should create a children array if the parent does not have one', () => {
    const items = makeItems();
    const newItem: PageNavigationItem = { id: 'b1', path: '/b/1', element: stub };

    addNavigationItem(items, 'b', newItem);

    const parent = items[1] as unknown as { children: PageNavigationItem[] };
    expect(parent.children).toHaveLength(1);
    expect(parent.children[0].id).toBe('b1');
  });
});

describe('addNavigationItemAfter', () => {
  it('should insert an item after the target at root level', () => {
    const items = makeItems();
    const newItem: PageNavigationItem = { id: 'c', path: '/c', element: stub };

    addNavigationItemAfter(items, 'a', newItem);

    expect(items).toHaveLength(3);
    expect(items[0].id).toBe('a');
    expect(items[1].id).toBe('c');
    expect(items[2].id).toBe('b');
  });

  it('should insert an item after the target in nested children', () => {
    const items = makeItems();
    const newItem: PageNavigationItem = { id: 'a1b', path: '/a/1b', element: stub };

    addNavigationItemAfter(items, 'a1', newItem);

    const parent = items[0] as PageNavigationItem & { children: PageNavigationItem[] };
    expect(parent.children).toHaveLength(3);
    expect(parent.children[0].id).toBe('a1');
    expect(parent.children[1].id).toBe('a1b');
    expect(parent.children[2].id).toBe('a2');
  });
});

describe('addNavigationItemBefore', () => {
  it('should insert an item before the target at root level', () => {
    const items = makeItems();
    const newItem: PageNavigationItem = { id: 'z', path: '/z', element: stub };

    addNavigationItemBefore(items, 'b', newItem);

    expect(items).toHaveLength(3);
    expect(items[0].id).toBe('a');
    expect(items[1].id).toBe('z');
    expect(items[2].id).toBe('b');
  });

  it('should insert an item before the target in nested children', () => {
    const items = makeItems();
    const newItem: PageNavigationItem = { id: 'a0', path: '/a/0', element: stub };

    addNavigationItemBefore(items, 'a1', newItem);

    const parent = items[0] as PageNavigationItem & { children: PageNavigationItem[] };
    expect(parent.children).toHaveLength(3);
    expect(parent.children[0].id).toBe('a0');
    expect(parent.children[1].id).toBe('a1');
    expect(parent.children[2].id).toBe('a2');
  });
});
