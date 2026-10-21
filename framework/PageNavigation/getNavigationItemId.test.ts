import { describe, expect, it } from 'vitest';
import type { PageNavigationItem } from './PageNavigationItem';
import { getNavigationItemId } from './getNavigationItemId';

const stub = null as unknown as JSX.Element;

describe('getNavigationItemId', () => {
  it('returns the id when the item has a non-empty id', () => {
    const item: PageNavigationItem = {
      id: 'settings',
      label: 'Settings',
      path: '/settings',
      element: stub,
    };

    expect(getNavigationItemId(item)).toBe('settings');
  });

  it('falls back to the label when the item id is empty', () => {
    const item: PageNavigationItem = {
      id: '',
      label: 'Empty id item',
      path: '/empty-id',
      element: stub,
    };

    expect(getNavigationItemId(item)).toBe('empty-id-item');
  });

  it('uses the id from a root child', () => {
    const item: PageNavigationItem = {
      label: 'Settings',
      path: '/settings',
      children: [{ id: 'settings-home', label: 'Home', path: '', element: stub }],
    };

    expect(getNavigationItemId(item)).toBe('settings-home');
  });

  it('falls back to the group label when there is no root child', () => {
    const item: PageNavigationItem = {
      label: 'Settings Group',
      path: '/settings',
      children: [{ id: 'profile', label: 'Profile', path: '/profile', element: stub }],
    };

    expect(getNavigationItemId(item)).toBe('settings-group');
  });

  it('falls back to the group label when the root child id is empty', () => {
    const item: PageNavigationItem = {
      label: 'Settings Group',
      path: '/settings',
      children: [{ id: '', label: 'Home', path: '', element: stub }],
    };

    expect(getNavigationItemId(item)).toBe('settings-group');
  });

  it('falls back to the label when the item does not have an id property', () => {
    const item: PageNavigationItem = {
      label: 'Unassigned item',
      path: '/unassigned',
      element: stub,
    };

    expect(getNavigationItemId(item)).toBe('unassigned-item');
  });
});
