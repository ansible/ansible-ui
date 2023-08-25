import { useEffect, useRef, useState } from 'react';

export function useIsMounted() {
  const [isMounted, setIsMounted] = useState(true);
  useEffect(
    () => () => {
      setIsMounted(false);
    },
    []
  );
  return isMounted;
}

export function useIsMountedRef() {
  const isMounted = useRef<{ isMounted: boolean }>({ isMounted: true });
  useEffect(
    () => () => {
      isMounted.current.isMounted = false;
    },
    []
  );
  return isMounted;
}
