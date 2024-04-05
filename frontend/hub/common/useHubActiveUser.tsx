import { ReactNode, createContext, useContext } from 'react';
import useSWR, { SWRResponse } from 'swr';
import { requestGet } from '../../common/crud/Data';
import { HubUser } from '../interfaces/expanded/HubUser';
import { hubAPI } from './api/formatPath';

export const HubActiveUserContext = createContext<SWRResponse<HubUser>>({
  isLoading: true,
} as SWRResponse<HubUser>);

export function useHubActiveUser() {
  return useContext(HubActiveUserContext).data;
}

export function useHubActiveUserContext() {
  return useContext(HubActiveUserContext);
}

export function HubActiveUserProvider(props: { children: ReactNode }) {
  const response = useSWR<HubUser>(hubAPI`/_ui/v1/me/`, requestGet, {
    dedupingInterval: 0,
    refreshInterval: 10 * 1000,
  });
  return (
    <HubActiveUserContext.Provider value={response}>{props.children}</HubActiveUserContext.Provider>
  );
}
