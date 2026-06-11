/**
 * HubInsightsApp - Insights-specific App Component
 *
 * Adapted for running inside the Insights Chrome shell:
 * - No masthead (Chrome provides the header)
 * - No sidebar (Chrome provides navigation)
 * - Just renders the route content
 */

import { PageNavigationItem } from '@ansible/ansible-ui-framework/PageNavigation/PageNavigationItem';
import { PageNotFound } from '@ansible/ansible-ui-framework/PageEmptyStates/PageNotFound';
import { usePageNavigationRoutesContext } from '@ansible/ansible-ui-framework/PageNavigation/PageNavigationRoutesProvider';
import { Navigate, Route, Routes } from 'react-router-dom';
import { ReactElement, useLayoutEffect, useMemo, useRef, isValidElement } from 'react';
import { useHubNavigation } from '../main/useHubNavigation';
import { Collections } from '../collections/Collections';

// Extended type that allows both element and children (actual runtime behavior)
type NavItem = PageNavigationItem & {
  element?: JSX.Element;
  children?: NavItem[];
};

/**
 * Check if an element is a Navigate component (used for redirects)
 */
function isNavigateElement(element: unknown): boolean {
  if (!isValidElement(element)) return false;
  return (
    element.type === Navigate ||
    (typeof element.type === 'function' && element.type.name === 'Navigate')
  );
}

/**
 * Type guard to check if children array exists and has items
 */
function hasChildren(item: NavItem): item is NavItem & { children: NavItem[] } {
  return Array.isArray(item.children) && item.children.length > 0;
}

/**
 * Find an index redirect (Navigate element with empty path) from navigation items
 */
function findIndexRedirect(children: NavItem[]): ReactElement | null {
  const redirectItem = children.find(
    (child) =>
      (child.path === '' || !child.path) && child.element && isNavigateElement(child.element)
  );
  return (redirectItem?.element as ReactElement) ?? null;
}

/**
 * Compute the full path for an item, handling duplicate slashes
 */
function computeFullPath(basePath: string, itemPath: string | undefined): string {
  if (!basePath) return itemPath || '';
  return `${basePath}/${itemPath || ''}`.replaceAll(/\/+/g, '/');
}

/**
 * Process child navigation items into Route elements with index redirects
 */
function processChildRoutes(children: NavItem[]): ReactElement[] {
  const processedChildren: ReactElement[] = [];
  const indexRedirect = findIndexRedirect(children);

  if (indexRedirect) {
    processedChildren.push(<Route key="index" index element={indexRedirect} />);
  }

  for (const child of children) {
    if (!isNavigateElement(child.element)) {
      processedChildren.push(...navigationToRoutes([child], ''));
    }
  }

  return processedChildren;
}

/**
 * Create a Route element with nested children
 */
function createNestedRoute(item: NavItem, fullPath: string, children: NavItem[]): ReactElement {
  const processedChildren = processChildRoutes(children);
  return (
    <Route key={item.id || fullPath} path={`${fullPath}/*`} element={item.element}>
      {processedChildren}
    </Route>
  );
}

/**
 * Create a simple Route element without children
 */
function createSimpleRoute(item: NavItem, fullPath: string): ReactElement {
  return <Route key={item.id || fullPath} path={fullPath} element={item.element} />;
}

/**
 * Recursively convert navigation items into Route elements with proper nesting
 * Navigate redirects are kept as index routes to properly redirect and activate tabs
 */
function navigationToRoutes(items: NavItem[], basePath = ''): ReactElement[] {
  const routes: ReactElement[] = [];

  for (const item of items) {
    if (item.element && isNavigateElement(item.element)) {
      continue;
    }

    const fullPath = computeFullPath(basePath, item.path);

    if (item.element && hasChildren(item)) {
      routes.push(createNestedRoute(item, fullPath, item.children));
    } else if (item.element) {
      routes.push(createSimpleRoute(item, fullPath));
    } else if (hasChildren(item)) {
      const filteredChildren = item.children.filter((child) => !isNavigateElement(child.element));
      routes.push(...navigationToRoutes(filteredChildren, fullPath));
    }
  }

  return routes;
}

// Base path for Insights mode - routes are relative to this
const INSIGHTS_BASE_PATH = process.env.ROUTE_PREFIX || '/ansible/automation-hub';

/**
 * The Insights-specific Hub app component.
 * Unlike HubApp, this does not render masthead or sidebar - Chrome provides those.
 */

export function HubInsightsApp() {
  const navigation = useHubNavigation() as NavItem[];

  // Use refs to ensure routes are only computed once (navigation creates new references each render)
  const navigationRef = useRef<NavItem[] | null>(null);
  const routeElementsRef = useRef<ReactElement[] | null>(null);

  // Only compute routes once on first render
  if (!navigationRef.current) {
    navigationRef.current = navigation;
    routeElementsRef.current = navigationToRoutes(navigation);
  }

  // Wrap navigation with base path so useGetPageUrl generates correct URLs
  const navigationWithBase = useMemo<PageNavigationItem[]>(
    () => [{ path: INSIGHTS_BASE_PATH, children: navigationRef.current! } as PageNavigationItem],
    [] // Empty deps - only compute once
  );

  // Register navigation routes with the framework so useGetPageUrl works
  // Use useLayoutEffect to ensure routes are registered before paint
  const [, setNavigation] = usePageNavigationRoutesContext();
  useLayoutEffect(() => {
    setNavigation(navigationWithBase);
  }, [navigationWithBase, setNavigation]);

  const routeElements = routeElementsRef.current!;

  return (
    <Routes>
      {/* Root path shows collections (like ansible-hub-ui) */}
      <Route path="" element={<Collections />} />
      <Route path="/" element={<Collections />} />
      {routeElements}
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
}
