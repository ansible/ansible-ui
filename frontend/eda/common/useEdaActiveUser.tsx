import { ReactNode, createContext, useContext, useMemo } from 'react';
import useSWR from 'swr';
import { requestGet } from '../../common/crud/Data';
import { EdaUser } from '../interfaces/EdaUser';
import { edaAPI } from './eda-utils';

interface EdaActiveUserState {
  activeEdaUser?: EdaUser;
  refreshActiveEdaUser?: () => void;
  activeEdaUserIsLoading?: boolean;
}

export const EdaActiveUserContext = createContext<EdaActiveUserState>({});

export function useEdaActiveUser() {
  return useContext(EdaActiveUserContext);
}

export function EdaActiveUserProvider(props: { children: ReactNode }) {
  const response = useSWR<EdaUser>(edaAPI`/users/me/`, requestGet, {
    dedupingInterval: 0,
    refreshInterval: 10 * 1000,
  });
  const { mutate } = response;
  const activeEdaUser = useMemo<EdaUser | undefined>(
    () => (response.error ? undefined : response.data),
    [response]
  );
  const activeEdaUserIsLoading = useMemo<boolean>(
    () => !response.error && response.isLoading,
    [response]
  );
  const state = useMemo<EdaActiveUserState>(() => {
    return {
      activeEdaUser,
      refreshActiveEdaUser: () => void mutate(),
      activeEdaUserIsLoading,
    };
  }, [activeEdaUser, activeEdaUserIsLoading, mutate]);
  return (
    <EdaActiveUserContext.Provider value={state}>{props.children}</EdaActiveUserContext.Provider>
  );
}
