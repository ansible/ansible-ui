import { ReactNode, createContext, useContext, useMemo } from 'react';
import useSWR from 'swr';
import { requestGet } from '../../common/crud/Data';
import { AwxUser } from '../interfaces/User';
import { AwxItemsResponse } from './AwxItemsResponse';
import { awxAPI } from './api/awx-utils';

interface ActiveUserState {
  activeAwxUser?: AwxUser;
  refreshActiveAwxUser?: () => void;
  activeAwxUserIsLoading?: boolean;
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
  const { mutate } = response;
  const activeAwxUser = useMemo<AwxUser | undefined>(() => {
    return !response.error && response.data?.results && response.data.results.length > 0
      ? response.data.results[0]
      : undefined;
  }, [response]);
  const activeAwxUserIsLoading = useMemo<boolean>(
    () => !response.error && response.isLoading,
    [response]
  );
  const state = useMemo<ActiveUserState>(() => {
    return {
      activeAwxUser,
      refreshActiveAwxUser: () => void mutate(),
      activeAwxUserIsLoading,
    };
  }, [activeAwxUser, activeAwxUserIsLoading, mutate]);
  return (
    <AwxActiveUserContext.Provider value={state}>{props.children}</AwxActiveUserContext.Provider>
  );
}
