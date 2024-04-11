interface PageNavigationGroup {
  id?: string;
  label?: string;
  subtitle?: string;
  path: string;
  children: PageNavigationItem[];
  hidden?: boolean;
}

interface PageNavigationComponent {
  id?: string;
  label?: string;
  subtitle?: string;
  path: string;
  element: JSX.Element;
  hidden?: boolean;
  badge?: string;
  badgeColor?: 'blue' | 'cyan' | 'green' | 'orange' | 'purple' | 'red' | 'grey' | 'gold';
}

/**
 * A navigation item for the PageNavigation component.
 *
 * Used both for the sidebar navigation and for the page routes.
 */
export type PageNavigationItem = PageNavigationGroup | PageNavigationComponent;

/**
 * Function to remove the leading slash from a path
 * Needed bacause routes cannot have slashes in the beginning
 */
export function removeLeadingSlash(path: string): string {
  return path.replace(/^\//, '');
}

/** Function to find a navigation item by id */
export function findNavigationItemById(
  navigationItems: PageNavigationItem[],
  id: string
): PageNavigationItem | undefined {
  for (const item of navigationItems) {
    if ('id' in item && item.id === id) {
      return item;
    } else if ('children' in item) {
      const child = findNavigationItemById(item.children, id);
      if (child) return child;
    }
  }
  return undefined;
}

/**
 * Function to remove a navigation item by id
 * @returns the removed item or undefined if not found
 */
export function removeNavigationItemById(
  navigationItems: PageNavigationItem[],
  id: string
): PageNavigationItem | undefined {
  for (let i = 0; i < navigationItems.length; i++) {
    const item = navigationItems[i];
    if ('id' in item && item.id === id) {
      navigationItems.splice(i, 1);
      return item;
    } else if ('children' in item) {
      const child = removeNavigationItemById(item.children, id);
      if (child) return child;
    }
  }
  return undefined;
}

/**
 * Function to add a navigation item as a child of another item
 */
export function addNavigationItem(
  navigationItems: PageNavigationItem[],
  parentId: string,
  newItem: PageNavigationItem
) {
  for (const item of navigationItems) {
    if ('id' in item && item.id === parentId) {
      const group = item as unknown as PageNavigationGroup;
      if (!('children' in item)) {
        group.children = [];
      }
      group.children.push(newItem);
      return;
    } else if ('children' in item) {
      addNavigationItem(item.children, parentId, newItem);
    }
  }
}

/**
 * Function to add a navigation item after another item
 */
export function addNavigationItemAfter(
  navigationItems: PageNavigationItem[],
  afterId: string,
  newItem: PageNavigationItem
) {
  for (let i = 0; i < navigationItems.length; i++) {
    const item = navigationItems[i];
    if ('id' in item && item.id === afterId) {
      navigationItems.splice(i + 1, 0, newItem);
      return;
    } else if ('children' in item) {
      addNavigationItemAfter(item.children, afterId, newItem);
    }
  }
}

/** Function to add a navigation item before another item */
export function addNavigationItemBefore(
  navigationItems: PageNavigationItem[],
  beforeId: string,
  newItem: PageNavigationItem
) {
  for (let i = 0; i < navigationItems.length; i++) {
    const item = navigationItems[i];
    if ('id' in item && item.id === beforeId) {
      navigationItems.splice(i, 0, newItem);
      return;
    } else if ('children' in item) {
      addNavigationItemBefore(item.children, beforeId, newItem);
    }
  }
}
