import { ReactNode, createContext, useContext } from 'react';
import useSWR, { SWRResponse } from 'swr';
import { requestGet } from '../../common/crud/Data';
import { EdaUser } from '../interfaces/EdaUser';
import { edaAPI } from './eda-utils';

export const EdaActiveUserContext = createContext<SWRResponse<EdaUser> | undefined>(undefined);

export function useEdaActiveUser() {
  return useContext(EdaActiveUserContext)?.data;
}

export function useEdaActiveUserContext() {
  return useContext(EdaActiveUserContext);
}

export function EdaActiveUserProvider(props: { children: ReactNode }) {
  const response = useSWR<EdaUser>(edaAPI`/users/me/`, requestGet, {
    dedupingInterval: 0,
    refreshInterval: 10 * 1000,
  });
  return (
    <EdaActiveUserContext.Provider value={response}>{props.children}</EdaActiveUserContext.Provider>
  );
}
