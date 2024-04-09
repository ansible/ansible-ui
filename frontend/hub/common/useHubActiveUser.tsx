import { ReactNode, createContext, useContext, useMemo } from 'react';
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
  const { mutate } = response;
  const activeHubUser = useMemo<HubUser | undefined>(
    () => (response.error ? undefined : response.data),
    [response]
  );
  const activeHubUserIsLoading = useMemo<boolean>(
    () => !response.error && response.isLoading,
    [response]
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
