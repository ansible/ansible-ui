import { usePageNavigationRoutes } from './PageNavigationRoutesProvider';

/** Hook to get the URL for navigation to a page given the page id. */
export function useGetPageUrl() {
  const routes = usePageNavigationRoutes();
  return (id: string) => routes[id];
}
