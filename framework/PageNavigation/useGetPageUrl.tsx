import { usePageNavigationRoutes } from './PageNavigationRoutesProvider';

/** Hook to get the URL for navigation to a page given the page id. */
export function useGetPageUrl() {
  const routes = usePageNavigationRoutes();
  return (
    id: string,
    options?: {
      params?: Record<string, string | number | undefined>;
      query?: Record<string, string | number | undefined>;
    }
  ) => {
    let url = routes[id] ?? '';
    const params = options?.params;
    const query = options?.query;
    if (url) {
      if (params) {
        url = Object.keys(params).reduce((acc, key) => {
          const value = params[key];
          if (value === undefined) return acc;
          return acc.replace(`:${key}`, (params[key] ?? '').toString());
        }, url);
      }
      if (query) {
        url = `${url}?${Object.keys(query)
          .map((key) => {
            const value = query[key];
            if (value === undefined) return '';
            return `${key}=${query[key]}`;
          })
          .join('&')
          .replace('/&&/g', '&')}`;
      }
    } else {
      console.error(`Page id ${id} not found`); // eslint-disable-line no-console
    }

    return url;
  };
}
