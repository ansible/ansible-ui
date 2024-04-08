import { ReactNode, createContext, useContext } from 'react';
import useSWR, { SWRResponse } from 'swr';
import { requestGet } from '../../common/crud/Data';
import { User } from '../interfaces/User';
import { AwxItemsResponse } from './AwxItemsResponse';
import { awxAPI } from './api/awx-utils';

export const AwxActiveUserContext = createContext<SWRResponse<AwxItemsResponse<User>> | undefined>(
  undefined
);

export function useAwxActiveUser() {
  const context = useContext(AwxActiveUserContext);
  const itemsResponse = context?.data;
  if (!itemsResponse) return undefined;
  if (!itemsResponse.results) return undefined;
  if (!itemsResponse.results.length) return undefined;
  return itemsResponse.results[0];
}

export function useAwxActiveUserContext() {
  return useContext(AwxActiveUserContext);
}

export function AwxActiveUserProvider(props: { children: ReactNode }) {
  const response = useSWR<AwxItemsResponse<User>>(awxAPI`/me/`, requestGet, {
    dedupingInterval: 0,
    refreshInterval: 10 * 1000,
  });
  return (
    <AwxActiveUserContext.Provider value={response}>{props.children}</AwxActiveUserContext.Provider>
  );
}
