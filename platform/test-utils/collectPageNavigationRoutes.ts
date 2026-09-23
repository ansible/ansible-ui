import { PageNavigationItem } from '@ansible/ansible-ui-framework';

export type PageNavigationRouteDescriptor = {
  id?: string;
  path: string;
};

/** Flattens a platform navigation tree for structural route assertions in tests. */
export function collectPageNavigationRoutes(
  navigation: PageNavigationItem | PageNavigationItem[]
): PageNavigationRouteDescriptor[] {
  const items = Array.isArray(navigation) ? navigation : [navigation];
  const routes: PageNavigationRouteDescriptor[] = [];

  for (const item of items) {
    routes.push({ id: item.id, path: item.path ?? '' });
    if ('children' in item && item.children?.length) {
      routes.push(...collectPageNavigationRoutes(item.children));
    }
  }

  return routes;
}

export function collectPageNavigationRouteIds(
  navigation: PageNavigationItem | PageNavigationItem[]
): string[] {
  return collectPageNavigationRoutes(navigation)
    .map((route) => route.id)
    .filter((id): id is string => Boolean(id));
}
