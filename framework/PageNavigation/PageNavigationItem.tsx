interface PageNavigationGroup {
  label?: string;
  path: string;
  children: PageNavigationItem[];
}

interface PageNavigationComponent {
  id: string;
  label?: string;
  path: string;
  element: JSX.Element;
}

/**
 * A navigation item for the PageNavigation component.
 *
 * Used both for the sidebar navigation and for the page routes.
 */
export type PageNavigationItem = PageNavigationGroup | PageNavigationComponent;

export function removeLeadingSlash(path: string): string {
  return path.replace(/^\//, '');
}
