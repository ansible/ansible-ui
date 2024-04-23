import { ReactNode, createContext, useContext, useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';
import { requestGet } from '../../common/crud/Data';
import { AwxUser } from '../interfaces/User';
import { AwxItemsResponse } from './AwxItemsResponse';
import { awxAPI } from './api/awx-utils';

interface ActiveUserState {
  /** The currently active user, or `null` if there is no active user, or `undefined` if the active user is still being loaded. */
  activeAwxUser?: AwxUser | null | undefined;
  refreshActiveAwxUser?: () => void;
}

export const AwxActiveUserContext = createContext<ActiveUserState>({});

export function useAwxActiveUser() {
  return useContext(AwxActiveUserContext);
}

export function AwxActiveUserProvider(props: { children: ReactNode }) {
  const response = useSWR<AwxItemsResponse<AwxUser>>(awxAPI`/me/`, requestGet, {
    dedupingInterval: 0,
    refreshInterval: 10 * 1000,
  });

  const [activeAwxUser, setActiveAwxUser] = useState<AwxUser | undefined | null>(undefined);

  useEffect(() => {
    setActiveAwxUser((activeUser) => {
      if (response.error) {
        return null;
      }

      if (response.data && response.data.results.length > 0) {
        return response.data.results[0];
      }

      if (response.isLoading && activeUser === undefined) {
        return undefined;
      }

      return null;
    });
  }, [response]);

  const mutate = response.mutate;
  const state = useMemo<ActiveUserState>(() => {
    return { activeAwxUser, refreshActiveAwxUser: () => void mutate(undefined) };
  }, [activeAwxUser, mutate]);

  return (
    <AwxActiveUserContext.Provider value={state}>{props.children}</AwxActiveUserContext.Provider>
  );
}
