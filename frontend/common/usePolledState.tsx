import { useCallback, useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';
import { requestGet } from './crud/Data';

/**
 * Helper class that wraps SWR so that isLoading does not cause refreshes.
 * - data: undefined if the data is loading, null if there is an error, or the data if it is loaded.
 * - error: the error
 * - refresh: a function to refresh the data
 */

export function usePolledState<T>(url: string) {
  const response = useSWR<T>(url, requestGet);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { mutate, error } = response;
  const [data, setData] = useState<T | undefined | null>(undefined);
  useEffect(() => {
    setData((config) => {
      if (response.error) {
        return null; //return null to indicate that there is no active user.
      }

      if (response.data) {
        return response.data;
      }

      if (response.isLoading) {
        return config; // keep the current active user.
      }

      return null;
    });
  }, [response]);

  const refresh = useCallback(() => {
    void mutate(undefined);
  }, [mutate]);

  const value = useMemo(
    () => ({ data, error: error as Error | undefined, refresh }),
    [data, error, refresh]
  );
  return value;
}
