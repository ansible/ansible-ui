import { useCallback } from 'react';
import { HubRemote } from '../Remotes';

export function useGetParsedInputUrl() {
  return useCallback((remote?: HubRemote) => {
    if (remote?.url === '' || remote === undefined) return '';
    try {
      return new URL(remote?.url);
    } catch {
      return '';
    }
  }, []);
}
