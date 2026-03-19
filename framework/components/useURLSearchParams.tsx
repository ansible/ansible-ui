import { useCallback, useState, useMemo } from 'react';
import { useWindowLocation } from './useWindowLocation';

// This hook is used to get and set URLSearchParams in the URL.
// It does not create a new navigation in navigation history when updating the URLSearchParams.
export function useURLSearchParams(): [
  URLSearchParams,
  (setSearchParams: URLSearchParams) => void,
] {
  const location = useWindowLocation();
  const [pathname] = useState(location.location?.pathname || '/');
  const searchParams = useMemo<URLSearchParams>(() => {
    /** Cypress component tests add a specPath param that must be ignored */
    let search = location.location?.search;
    if (search && search.includes('?specPath=')) {
      search = search.substring(0, search.indexOf('?specPath='));
    } else if (search && search.includes('&specPath=')) {
      search = search.substring(0, search.indexOf('&specPath='));
    }
    return new URLSearchParams(search ?? '/');
  }, [location.location?.search]);

  const setSearchParams = useCallback(
    (searchParams: URLSearchParams) => {
      if (pathname !== (location.location?.pathname || '/')) {
        // don't change query params if we've navigated away from original page
        return;
      }
      const newSearch = searchParams.toString();
      const currentSearch = location.location?.search?.replace(/^\?/, '') ?? '';
      // Skip update if the search string hasn't changed to avoid
      // excessive history.replaceState calls (Firefox rate-limits these)
      if (newSearch === currentSearch) return;
      if (newSearch) location.update('?' + newSearch);
      else location.update(pathname); // retain the existing pathname
    },
    [location, pathname]
  );
  return [searchParams, setSearchParams];
}
