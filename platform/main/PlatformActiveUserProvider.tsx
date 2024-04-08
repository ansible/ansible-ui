import { ReactNode, createContext, useContext, useMemo } from 'react';
import useSWR from 'swr';
import { AwxItemsResponse } from '../../frontend/awx/common/AwxItemsResponse';
import { requestGet } from '../../frontend/common/crud/Data';
import { gatewayAPI } from '../api/gateway-api-utils';
import { PlatformUser } from '../interfaces/PlatformUser';

interface PlatformActiveUserState {
  user?: PlatformUser;
  refresh?: () => void;
  isLoading?: boolean;
}

export const PlatformActiveUserContext = createContext<PlatformActiveUserState>({});

export function usePlatformActiveUser() {
  return useContext(PlatformActiveUserContext);
}

export function PlatformActiveUserProvider(props: { children: ReactNode }) {
  const response = useSWR<AwxItemsResponse<PlatformUser>>(gatewayAPI`/me/`, requestGet, {
    dedupingInterval: 0,
    refreshInterval: 10 * 1000,
  });
  const { mutate } = response;

  const user = useMemo<PlatformUser | undefined>(() => {
    return !response.error && response.data?.results && response.data.results.length > 0
      ? response.data.results[0]
      : undefined;
  }, [response]);

  const isLoading = useMemo<boolean>(() => !response.error && response.isLoading, [response]);

  const platformActiveUserState = useMemo<PlatformActiveUserState>(() => {
    return { user, refresh: () => void mutate(), isLoading };
  }, [user, isLoading, mutate]);

  return (
    <PlatformActiveUserContext.Provider value={platformActiveUserState}>
      {props.children}
    </PlatformActiveUserContext.Provider>
  );
}
