import { ReactNode, createContext, useContext, useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';
import { requestGet } from '../../common/crud/Data';
import { AwxUser } from '../interfaces/User';
import { AwxItemsResponse } from './AwxItemsResponse';
import { awxAPI } from './api/awx-utils';

interface ActiveUserState {
  /** The currently active user, or `null` if there is no active user, or `undefined` if the active user is still being loaded. */
  activeAwxUser?: AwxUser | null | undefined;
  refreshActiveAwxUser?: () => void;
}

export const AwxActiveUserContext = createContext<ActiveUserState>({});

export function useAwxActiveUser() {
  return useContext(AwxActiveUserContext);
}

export function AwxActiveUserProvider(props: { children: ReactNode }) {
  const response = useSWR<AwxItemsResponse<AwxUser>>(awxAPI`/me/`, requestGet, {
    dedupingInterval: 0,
    refreshInterval: 10 * 1000,
  });

  const [activeAwxUser, setActiveAwxUser] = useState<AwxUser | undefined | null>(undefined);

  useEffect(() => {
    setActiveAwxUser((activeUser) => {
      if (response.error) {
        return null; //return null to indicate that there is no active user.
      }

      if (response.data && response.data.results.length > 0) {
        return response.data.results[0];
      }

      if (response.isLoading) {
        return activeUser; // keep the current active user.
      }

      return null;
    });
  }, [response]);

  const mutate = response.mutate;
  const state = useMemo<ActiveUserState>(() => {
    return { activeAwxUser, refreshActiveAwxUser: () => void mutate(undefined) };
  }, [activeAwxUser, mutate]);

  return (
    <AwxActiveUserContext.Provider value={state}>{props.children}</AwxActiveUserContext.Provider>
  );
import { createContext, useContext } from 'react';
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

export function useAwxRefreshUser() {
  return useContext(AwxActiveUserContext).refresh;
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
