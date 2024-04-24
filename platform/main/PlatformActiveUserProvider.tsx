import { ReactNode, createContext, useContext, useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';
import { requestGet } from '../../frontend/common/crud/Data';
import { gatewayAPI } from '../api/gateway-api-utils';
import { PlatformItemsResponse } from '../interfaces/PlatformItemsResponse';
import { PlatformUser } from '../interfaces/PlatformUser';

interface ActiveUserState {
  activePlatformUser?: PlatformUser | null | undefined;
  refreshActivePlatformUser?: () => void;
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

  const [activePlatformUser, setActivePlatformUser] = useState<PlatformUser | undefined | null>(
    undefined
  );

  useEffect(() => {
    setActivePlatformUser((activeUser) => {
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
    return { activePlatformUser, refreshActivePlatformUser: () => void mutate(undefined) };
  }, [activePlatformUser, mutate]);

  return (
    <PlatformActiveUserContext.Provider value={state}>
      {props.children}
    </PlatformActiveUserContext.Provider>
  );
}
