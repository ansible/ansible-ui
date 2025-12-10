import { matchPath } from 'react-router-dom';
import { PageNavigationItem } from '../PageNavigation/PageNavigationItem';

/*
Recursively search navigation tree to find the current path.
Returns array containing the PageNavigationItem of the current page and its
parent & grandparent PageNavigationItems in increasing order.
*/
export function findNavigationItemByPath(
  items: PageNavigationItem[],
  pathname: string,
  basePath: string = '',
  parents: PageNavigationItem[] = []
): PageNavigationItem[] {
  for (const item of items) {
    // Build the full path for this item
    let fullPath = basePath + '/' + item.path;
    fullPath = fullPath.replace('//', '/');

    // Check if current path matches this item
    const match = matchPath(fullPath + '/*', pathname);

    if (!match) {
      continue;
    }

    const hasChildren = 'children' in item && item.children;
    // If this item has children, search them first (depth-first)
    if (hasChildren) {
      const nextParents = 'label' in item ? [item, ...parents] : [...parents];
      return findNavigationItemByPath(item.children, pathname, fullPath, nextParents);
    }

    // If no deeper match found, this is our item
    // item has an empty path item for default/index pages in a section, so
    // it can be omitted in those cases
    return item.path ? [item, ...parents] : [...parents];
  }

  return [];
}

export function getNavigationTitle(navMatch: PageNavigationItem[], currentTitle?: string | null) {
  const labels = navMatch.map((item) => item.label);

  if (!labels[0] && currentTitle) {
    labels[0] = currentTitle;
  }

  return labels.filter((item) => item !== '').join(' - ');
}
