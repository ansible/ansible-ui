import { createContext, useContext } from 'react';
import { HubUser } from '../interfaces/expanded/HubUser';

export const HubActiveUserContext = createContext<{ user: HubUser; refresh: () => void }>({
  user: {} as HubUser,
  refresh: () => null,
});

export function useHubActiveUser() {
  return useContext(HubActiveUserContext).user;
}

export function useHubRefreshUser() {
  return useContext(HubActiveUserContext).refresh;
}
