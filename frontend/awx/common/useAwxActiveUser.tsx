import { ReactNode, createContext, useContext, useEffect, useMemo, useState } from 'react';
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

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { error, isLoading, data, mutate } = response;

  const [activeAwxUser, setActiveAwxUser] = useState<AwxUser | undefined>(undefined);

  useEffect(() => {
    if (error) {
      setActiveAwxUser(undefined);
    }
  }, [error]);

  useEffect(() => {
    if (data?.results && data.results.length > 0) {
      setActiveAwxUser(data.results[0]);
    }
  }, [data]);

  const activeAwxUserIsLoading = useMemo<boolean>(
    () => (!activeAwxUser && !error) || isLoading,
    [activeAwxUser, isLoading, error]
  );

  const state = useMemo<ActiveUserState>(() => {
    return {
      activeAwxUser,
      refreshActiveAwxUser: () => void mutate(undefined),
      activeAwxUserIsLoading,
    };
  }, [activeAwxUser, activeAwxUserIsLoading, mutate]);

  return (
    <AwxActiveUserContext.Provider value={state}>{props.children}</AwxActiveUserContext.Provider>
  );
}
