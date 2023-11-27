import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { AwxItemsResponse } from '../awx/common/AwxItemsResponse';
import { User } from '../awx/interfaces/User';
import { edaAPI } from '../eda/api/eda-utils';
import { EdaUser } from '../eda/interfaces/EdaUser';
import { useGet } from './crud/useGet';

const ActiveUserContext = createContext<User | EdaUser | null | undefined>(undefined);

/**
 * Get the active logged in user
 * @returns undefined while querying, null if user not logged in, otherwise the User.
 */
export function useActiveUser() {
  return useContext(ActiveUserContext) as User;
}

export function useEdaActiveUser() {
  return useContext(ActiveUserContext) as EdaUser;
}

export function ActiveUserProvider(props: { children?: ReactNode }) {
  const [activeUser, setActiveUser] = useState<User | null | undefined>(undefined);
  const userResponse = useGet<AwxItemsResponse<User>>('/api/v2/me/');
  useEffect(() => {
    if (
      userResponse.data &&
      userResponse.data.count === 1 &&
      userResponse.data.results.length === 1
    ) {
      setActiveUser(userResponse.data.results[0] ?? null);
    }
  }, [userResponse.data]);
  return (
    <ActiveUserContext.Provider value={activeUser}>{props.children}</ActiveUserContext.Provider>
  );
}

export function ActiveEdaUserProvider(props: { children?: ReactNode }) {
  const [activeUser, setActiveUser] = useState<EdaUser | null | undefined>(undefined);
  const userResponse = useGet<EdaUser>(edaAPI`/users/me/`);
  useEffect(() => {
    if (userResponse.data) {
      setActiveUser(userResponse.data ?? null);
    }
  }, [userResponse.data]);
  return (
    <ActiveUserContext.Provider value={activeUser}>{props.children}</ActiveUserContext.Provider>
  );
}
