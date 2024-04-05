<<<<<<< HEAD
import { ReactNode, createContext, useContext, useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';
import { requestGet } from '../../common/crud/Data';
=======
import { createContext, useContext } from 'react';
>>>>>>> 8269c803c (Login Flow Update (#1946))
import { EdaUser } from '../interfaces/EdaUser';

<<<<<<< HEAD
interface ActiveUserState {
  /** The currently active user, or `null` if there is no active user, or `undefined` if the active user is still being loaded. */
  activeEdaUser?: EdaUser | null | undefined;
  refreshActiveEdaUser?: () => void;
}

export const EdaActiveUserContext = createContext<ActiveUserState>({});
=======
export const EdaActiveUserContext = createContext<{ user: EdaUser; refresh: () => void }>({
  user: {} as EdaUser,
  refresh: () => null,
});
>>>>>>> 8269c803c (Login Flow Update (#1946))

export function useEdaActiveUser() {
  return useContext(EdaActiveUserContext).user;
}

<<<<<<< HEAD
export function EdaActiveUserProvider(props: { children: ReactNode }) {
  const response = useSWR<EdaUser>(edaAPI`/users/me/`, requestGet, {
    dedupingInterval: 0,
    refreshInterval: 10 * 1000,
  });

  const [activeEdaUser, setActiveEdaUser] = useState<EdaUser | undefined | null>(undefined);

  useEffect(() => {
    setActiveEdaUser((activeUser) => {
      if (response.error) {
        return null; // return null to indicate that there is no active user.
      }

      if (response.data) {
        return response.data;
      }

      if (response.isLoading) {
        return activeUser; // keep the current active user.
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
=======
export function useEdaRefreshUser() {
  return useContext(EdaActiveUserContext).refresh;
>>>>>>> 8269c803c (Login Flow Update (#1946))
}
