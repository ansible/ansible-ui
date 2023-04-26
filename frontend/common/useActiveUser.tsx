import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { User } from '../awx/interfaces/User';
import { ItemsResponse } from './crud/Data';
import { useGet } from './crud/useGet';
import { useAutomationServers } from '../automation-servers/contexts/AutomationServerProvider';
import { API_PREFIX } from '../eda/constants';

const ActiveUserContext = createContext<User | null | undefined>(undefined);

/**
 * Get the active logged in user
 * @returns undefined while querying, null if user not logged in, otherwise the User.
 */
export function useActiveUser() {
  return useContext(ActiveUserContext);
}

export function ActiveUserProvider(props: { children?: ReactNode }) {
  const [activeUser, setActiveUser] = useState<User | null | undefined>(undefined);
  const { automationServer } = useAutomationServers();
  const userResponse = useGet<ItemsResponse<User>>(
    automationServer?.type === 'EDA' ? `${API_PREFIX}/me/` : '/api/v2/me/'
  );
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
