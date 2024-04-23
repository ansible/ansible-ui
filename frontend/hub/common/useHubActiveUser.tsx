import { ReactNode, createContext, useContext, useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';
import { requestGet } from '../../common/crud/Data';
import { HubUser } from '../interfaces/expanded/HubUser';
import { hubAPI } from './api/formatPath';

interface ActiveUserState {
  /** The currently active user, or `null` if there is no active user, or `undefined` if the active user is still being loaded. */
  activeHubUser?: HubUser | null | undefined;
  refreshActiveHubUser?: () => void;
}

export const HubActiveUserContext = createContext<ActiveUserState>({});

export function useHubActiveUser() {
  return useContext(HubActiveUserContext);
}

export function HubActiveUserProvider(props: { children: ReactNode }) {
  const response = useSWR<HubUser>(hubAPI`/_ui/v1/me/`, requestGet, {
    dedupingInterval: 0,
    refreshInterval: 10 * 1000,
  });

  const [activeHubUser, setActiveHubUser] = useState<HubUser | undefined | null>(undefined);

  useEffect(() => {
    setActiveHubUser((activeUser) => {
      if (response.error) {
        return null;
      }

      if (response.data) {
        return response.data;
      }

      if (response.isLoading && activeUser === undefined) {
        return undefined;
      }

      return null;
    });
  }, [response]);

  const mutate = response.mutate;
  const state = useMemo<ActiveUserState>(() => {
    return { activeHubUser, refreshActiveHubUser: () => void mutate(undefined) };
  }, [activeHubUser, mutate]);

  return (
    <HubActiveUserContext.Provider value={state}>{props.children}</HubActiveUserContext.Provider>
  );
}
