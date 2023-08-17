import { useEffect, useRef } from 'react';

export function useAbortController() {
  const abortControllerRef = useRef(new AbortController());
  useEffect(() => {
    const abortController = abortControllerRef.current;
    return () => abortController.abort();
  }, []);
  return abortControllerRef.current;
}
