import { useEffect } from 'react';
import { useSWRConfig } from 'swr';

export function useInvalidateCacheOnUnmount() {
  const { cache } = useSWRConfig();
  useEffect(() => () => (cache as unknown as { clear: () => void }).clear?.(), [cache]);
}
