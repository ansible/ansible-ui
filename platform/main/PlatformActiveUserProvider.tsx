import { ReactNode, createContext, useContext } from 'react';
import useSWR, { SWRResponse } from 'swr';
import { User } from '../../frontend/awx/interfaces/User';
import { requestGet } from '../../frontend/common/crud/Data';
import { gatewayAPI } from '../api/gateway-api-utils';
import { PlatformItemsResponse } from '../interfaces/PlatformItemsResponse';

export const PlatformActiveUserContext = createContext<
  SWRResponse<PlatformItemsResponse<User>> | undefined
>(undefined);

export function usePlatformActiveUser() {
  const context = useContext(PlatformActiveUserContext);
  const itemsResponse = context?.data;
  if (!itemsResponse) return undefined;
  if (!itemsResponse.results) return undefined;
  if (!itemsResponse.results.length) return undefined;
  return itemsResponse.results[0];
}

export function usePlatformActiveUserContext() {
  return useContext(PlatformActiveUserContext);
}

export function PlatformActiveUserProvider(props: { children: ReactNode }) {
  const response = useSWR<PlatformItemsResponse<User>>(gatewayAPI`/me/`, requestGet, {
    dedupingInterval: 0,
    refreshInterval: 10 * 1000,
  });
  return (
    <PlatformActiveUserContext.Provider value={response}>
      {props.children}
    </PlatformActiveUserContext.Provider>
  );
}
