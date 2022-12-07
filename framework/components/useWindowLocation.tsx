import { useCallback, useEffect, useState } from 'react';
import { useIsMounted } from './useIsMounted';

export function useWindowLocation() {
  const isMounted = useIsMounted();
  const [location, setLocation] = useState<Location | void>(
    isMounted ? window.location : undefined
  );

  const setWindowLocation = useCallback(() => {
    setLocation(window.location);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    if (!location) {
      setWindowLocation();
    }
    window.addEventListener('popstate', setWindowLocation);
    return () => {
      window.removeEventListener('popstate', setWindowLocation);
    };
  }, [isMounted, location, setWindowLocation]);

  const push = useCallback(
    (url?: string | URL | null) => {
      window.history.replaceState(null, '', url);
      setWindowLocation();
    },
    [setWindowLocation]
  );

  const update = useCallback(
    (url?: string | URL | null) => {
      window.history.replaceState(null, '', url);
      setWindowLocation();
    },
    [setWindowLocation]
  );

  return { location, push, update };
}
