import { useCallback, useEffect } from 'react';
import { useSWRConfig } from 'swr';

export function useInvalidateCacheOnUnmount() {
  const { mutate } = useSWRConfig();
  // https://swr.vercel.app/docs/mutation#revalidation
  // When you call mutate(key) without any data, it will trigger a revalidation for the resource.
  useEffect(() => () => void mutate(() => true), [mutate]);
}

/**
 * Custom hook that provides functions to clear the SWR cache.
 * It returns two functions: one to clear all cache, and another to clear cache by a
 * specific key. `clearCacheByKey` is particularly useful for scenarios such as forms
 * when creating a new resource. By clearing the cache using the URL from the main table,
 * it helps to avoid flickering. This is essential especially if it's the first resource
 * being created, as SWR would otherwise provide no results.
 */
export function useClearCache() {
  const { cache } = useSWRConfig();

  const clearAllCache = useCallback(() => {
    for (const key of cache.keys()) {
      cache.delete(key);
    }
  }, [cache]);

  const INFINITE_KEY = '$inf$';

  const clearCacheByKey = useCallback(
    (key: string) => {
      const keyBase = removeQueryString(key);
      for (const cacheKey of cache.keys()) {
        if (typeof cacheKey === 'string') {
          let cacheKeyBase = removeQueryString(cacheKey);
          if (cacheKeyBase.startsWith(INFINITE_KEY)) {
            cacheKeyBase = cacheKeyBase.slice(INFINITE_KEY.length);
          }
          if (cacheKeyBase.startsWith(keyBase)) {
            cache.delete(cacheKey);
          }
        }
      }
    },
    [cache]
  );

  return { clearAllCache, clearCacheByKey };
}

function removeQueryString(url: string) {
  if (url.includes('?')) {
    return url.split('?')[0];
  }
  return url;
}
