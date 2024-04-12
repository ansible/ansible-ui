import { ReactNode, createContext, useContext, useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';
import { requestGet } from '../../frontend/common/crud/Data';
import { gatewayAPI } from '../api/gateway-api-utils';
import { PlatformItemsResponse } from '../interfaces/PlatformItemsResponse';
import { PlatformUser } from '../interfaces/PlatformUser';

interface ActiveUserState {
  activePlatformUser?: PlatformUser;
  refreshActivePlatformUser?: () => void;
  activePlatformUserIsLoading?: boolean;
}

export const PlatformActiveUserContext = createContext<ActiveUserState>({});

export function usePlatformActiveUser() {
  return useContext(PlatformActiveUserContext);
}

export function PlatformActiveUserProvider(props: { children: ReactNode }) {
  const response = useSWR<PlatformItemsResponse<PlatformUser>>(gatewayAPI`/me/`, requestGet, {
    dedupingInterval: 0,
    refreshInterval: 10 * 1000,
  });

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { error, isLoading, data, mutate } = response;

  const [activePlatformUser, setActivePlatformUser] = useState<PlatformUser | undefined>(undefined);

  useEffect(() => {
    if (error) {
      setActivePlatformUser(undefined);
    }
  }, [error]);

  useEffect(() => {
    if (data?.results && data.results.length > 0) {
      setActivePlatformUser(data.results[0]);
    }
  }, [data]);

  const activePlatformUserIsLoading = useMemo<boolean>(
    () => !activePlatformUser && !error && isLoading,
    [activePlatformUser, isLoading, error]
  );

  const state = useMemo<ActiveUserState>(() => {
    return {
      activePlatformUser,
      refreshActivePlatformUser: () => void mutate(undefined),
      activePlatformUserIsLoading,
    };
  }, [activePlatformUser, activePlatformUserIsLoading, mutate]);

  return (
    <PlatformActiveUserContext.Provider value={state}>
      {props.children}
    </PlatformActiveUserContext.Provider>
  );
}
