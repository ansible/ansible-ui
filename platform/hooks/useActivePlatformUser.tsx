import { useGet } from '@ansible/common-ui/crud/useGet';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { PlatformItemsResponse } from '../interfaces/PlatformItemsResponse';
import { PlatformUser } from '../interfaces/PlatformUser';
import { gatewayAPI } from '../utils/gateway-api-utils';

const ActivePlatformUserContext = createContext<PlatformUser | null | undefined>(undefined);

/**
 * Get the active logged in user
 * @returns undefined while querying, null if user not logged in, otherwise the User.
 */
export function useActivePlatformUser() {
  return useContext(ActivePlatformUserContext) as PlatformUser;
}

export function ActivePlatformUserProvider(props: Readonly<{ children?: ReactNode }>) {
  const [activeUser, setActiveUser] = useState<PlatformUser | null | undefined>(undefined);
  const userResponse = useGet<PlatformItemsResponse<PlatformUser>>(gatewayAPI`/me/`);
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
