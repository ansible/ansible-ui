import type { PageNavigationItem } from './PageNavigationItem';

export function getNavigationItemId(item: PageNavigationItem): string | undefined {
  let id: string | undefined;
  if ('id' in item) {
    id = item.id;
  } else if ('children' in item) {
    const rootChild = item.children.find((child) => child.path === '');
    if (rootChild && 'id' in rootChild) {
      id = rootChild.id;
    }
  }
  return id || item.label?.split(' ').join('-').toLowerCase();
}
