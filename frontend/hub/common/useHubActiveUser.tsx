import { ReactNode, createContext, useContext, useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';
import { requestGet } from '../../common/crud/Data';
import { HubUser } from '../interfaces/expanded/HubUser';
import { hubAPI } from './api/formatPath';

interface HubActiveUserState {
  activeHubUser?: HubUser;
  refreshActiveHubUser?: () => void;
  activeHubUserIsLoading?: boolean;
}

export const HubActiveUserContext = createContext<HubActiveUserState>({});

export function useHubActiveUser() {
  return useContext(HubActiveUserContext);
}

export function HubActiveUserProvider(props: { children: ReactNode }) {
  const response = useSWR<HubUser>(hubAPI`/_ui/v1/me/`, requestGet, {
    dedupingInterval: 0,
    refreshInterval: 10 * 1000,
  });

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { error, isLoading, data, mutate } = response;

  const [activeHubUser, setActiveHubUser] = useState<HubUser | undefined>(undefined);

  useEffect(() => {
    if (error) {
      setActiveHubUser(undefined);
    }
  }, [error]);

  useEffect(() => {
    if (data) {
      setActiveHubUser(data);
    }
  }, [data]);

  const activeHubUserIsLoading = useMemo<boolean>(
    () => !activeHubUser && !error && isLoading,
    [activeHubUser, isLoading, error]
  );

  const state = useMemo<HubActiveUserState>(() => {
    return {
      activeHubUser,
      refreshActiveHubUser: () => void mutate(undefined),
      activeHubUserIsLoading,
    };
  }, [activeHubUser, activeHubUserIsLoading, mutate]);

  return (
    <HubActiveUserContext.Provider value={state}>{props.children}</HubActiveUserContext.Provider>
  );
}
