import { useCallback } from 'react';
import { usePageNavigationRoutes } from './PageNavigationRoutesProvider';

/** Hook to get the URL for navigation to a page given the page id. */
export function useGetPageUrl() {
  const routes = usePageNavigationRoutes();
  return useCallback(
    (
      id: string,
      options?: {
        params?: Record<string, string | number | undefined>;
        query?: Record<string, string | string[] | number | number[] | undefined>;
      }
    ) => {
      let url = routes[id] ?? '';
      const params = options?.params;
      const query = options?.query;
      if (url) {
        if (params) {
          url = Object.keys(params).reduce((acc, key) => {
            let value = params[key];
            if (value === undefined) return acc;
            value = encodeURIComponent(value.toString());
            const stringToReplace = ':' + key;
            // search for longest string is necessary, because without it, we can replace substring
            const regex = new RegExp(stringToReplace + '(?!.*' + stringToReplace + ')', 'g');
            return acc.replace(regex, value);
          }, url);
        }
        if (query) {
          url = `${url}?${Object.keys(query)
            .map((key) => {
              let value = query[key];
              if (value === undefined) return '';
              value = encodeURIComponent(value.toString());
              return `${key}=${value}`;
            })
            .join('&')
            .replace('/&&/g', '&')}`;
        }
      } else {
        console.error(`Page id ${id} not found`); // eslint-disable-line no-console
      }

      return url;
    },
    [routes]
  );
}
