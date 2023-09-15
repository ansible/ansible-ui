import { usePageNavigationRoutes } from './PageNavigationRoutesProvider';

/** Hook to get the URL for navigation to a page given the page id. */
export function useGetPageUrl() {
  const routes = usePageNavigationRoutes();
  return (
    id: string,
    options?: {
      params?: Record<string, string | number>;
      query?: Record<string, string | number>;
    }
  ) => {
    let url = routes[id] ?? '';
    const params = options?.params;
    const query = options?.query;
    if (url) {
      if (params) {
        url = Object.keys(params).reduce(
          (acc, key) => acc.replace(`:${key}`, (params[key] ?? '').toString()),
          url
        );
      }
      if (query) {
        url = `${url}?${Object.keys(query)
          .map((key) => `${key}=${query[key]}`)
          .join('&')}`;
      }
    } else {
      console.error(`Page id ${id} not found`); // eslint-disable-line no-console
    }

    return url;
  };
}
