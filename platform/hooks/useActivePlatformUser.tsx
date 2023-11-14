import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { PlatformItemsResponse } from '../interfaces/PlatformItemsResponse';
import { User } from '../interfaces/User';
import { useGet } from '../../frontend/common/crud/useGet';
import { gatewayAPI } from '../api/gateway-api-utils';

const ActivePlatformUserContext = createContext<User | null | undefined>(undefined);

/**
 * Get the active logged in user
 * @returns undefined while querying, null if user not logged in, otherwise the User.
 */
export function useActivePlatformUser() {
  return useContext(ActivePlatformUserContext) as User;
}

export function ActivePlatformUserProvider(props: { children?: ReactNode }) {
  const [activeUser, setActiveUser] = useState<User | null | undefined>(undefined);
  const userResponse = useGet<PlatformItemsResponse<User>>(gatewayAPI`/v1/me`);
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
    <ActivePlatformUserContext.Provider value={activeUser}>
      {props.children}
    </ActivePlatformUserContext.Provider>
  );
}
