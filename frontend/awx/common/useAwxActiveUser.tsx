import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { useGet } from '../../common/crud/useGet';
import { User } from '../interfaces/User';
import { awxAPI } from './api/awx-utils';
import { AwxItemsResponse } from './AwxItemsResponse';

const AwxActiveUserContext = createContext<User | null | undefined>(undefined);

/**
 * Get the active logged in user
 * @returns undefined while querying, null if user not logged in, otherwise the User.
 */
export function useAwxActiveUser() {
  return useContext(AwxActiveUserContext) as User;
}

export function AwxActiveUserProvider(props: { children?: ReactNode }) {
  const [activeUser, setActiveUser] = useState<User | null | undefined>(undefined);
  const userResponse = useGet<AwxItemsResponse<User>>(awxAPI`/me/`);
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
    <AwxActiveUserContext.Provider value={activeUser}>
      {props.children}
    </AwxActiveUserContext.Provider>
  );
}
