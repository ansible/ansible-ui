import { usePageNavigationRoutes } from './PageNavigationRoutesProvider';

/** Hook to get the URL for navigation to a page given the page id. */
export function useGetPageUrl() {
  const routes = usePageNavigationRoutes();
  return (id: string, params?: Record<string, string>) => {
    const url = routes[id];
    if (url) {
      if (!params) return url;
      return Object.keys(params).reduce((acc, key) => acc.replace(`:${key}`, params[key]), url);
    }
    return '';
  };
}
