import { useCallback, useMemo } from 'react';
import { useWindowLocation } from './useWindowLocation';

export function useSearchParams(): [URLSearchParams, (setSearchParams: URLSearchParams) => void] {
  const location = useWindowLocation();
  const pathname = location.location?.pathname || '/';
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
      const newSearch = searchParams.toString();
      if (newSearch) location.update('?' + newSearch);
      else location.update(pathname); // retain the existing pathname
    },
    [location, pathname]
  );
  return [searchParams, setSearchParams];
}
