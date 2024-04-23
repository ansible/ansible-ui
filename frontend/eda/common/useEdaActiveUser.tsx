import { ReactNode, createContext, useContext, useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';
import { requestGet } from '../../common/crud/Data';
import { EdaUser } from '../interfaces/EdaUser';
import { edaAPI } from './eda-utils';

interface ActiveUserState {
  /** The currently active user, or `null` if there is no active user, or `undefined` if the active user is still being loaded. */
  activeEdaUser?: EdaUser | null | undefined;
  refreshActiveEdaUser?: () => void;
}

export const EdaActiveUserContext = createContext<ActiveUserState>({});

export function useEdaActiveUser() {
  return useContext(EdaActiveUserContext);
}

export function EdaActiveUserProvider(props: { children: ReactNode }) {
  const response = useSWR<EdaUser>(edaAPI`/users/me/`, requestGet, {
    dedupingInterval: 0,
    refreshInterval: 10 * 1000,
  });

  const [activeEdaUser, setActiveEdaUser] = useState<EdaUser | undefined | null>(undefined);

  useEffect(() => {
    setActiveEdaUser((activeUser) => {
      if (response.error) {
        return null;
      }

      if (response.data) {
        return response.data;
      }

      if (response.isLoading && activeUser === undefined) {
        return undefined;
      }

      return null;
    });
  }, [response]);

  const mutate = response.mutate;
  const state = useMemo<ActiveUserState>(() => {
    return { activeEdaUser, refreshActiveEdaUser: () => void mutate(undefined) };
  }, [activeEdaUser, mutate]);

  return (
    <EdaActiveUserContext.Provider value={state}>{props.children}</EdaActiveUserContext.Provider>
  );
}
