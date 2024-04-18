import { ReactNode, createContext, useContext, useEffect, useMemo, useState } from 'react';
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

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { error, isLoading, data, mutate } = response;

  const [activeEdaUser, setActiveEdaUser] = useState<EdaUser | undefined>(undefined);

  useEffect(() => {
    if (error) {
      setActiveEdaUser(undefined);
    }
  }, [error]);

  useEffect(() => {
    if (data) {
      setActiveEdaUser(data);
    }
  }, [data]);

  const activeEdaUserIsLoading = useMemo<boolean>(
    () => (!activeEdaUser && !error) || isLoading,
    [activeEdaUser, isLoading, error]
  );

  const state = useMemo<EdaActiveUserState>(() => {
    return {
      activeEdaUser,
      refreshActiveEdaUser: () => void mutate(undefined),
      activeEdaUserIsLoading,
    };
  }, [activeEdaUser, activeEdaUserIsLoading, mutate]);

  return (
    <EdaActiveUserContext.Provider value={state}>{props.children}</EdaActiveUserContext.Provider>
  );
}
