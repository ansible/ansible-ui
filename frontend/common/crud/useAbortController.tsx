import { useEffect, useRef } from 'react';

export function useAbortController() {
  const abortControllerRef = useRef(new AbortController());
  useEffect(() => {
    const abortController = abortControllerRef.current;
    return () => abortController.abort('Aborted by useAbortController unmounting.');
  }, []);
  return abortControllerRef.current;
}
