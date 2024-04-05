import { createContext, useContext } from 'react';
import { User } from '../interfaces/User';

export const AwxActiveUserContext = createContext<{ user: User; refresh: () => void }>({
  user: {} as User,
  refresh: () => null,
});

export function useAwxActiveUser() {
  return useContext(AwxActiveUserContext).user;
}

export function useAwxRefreshUser() {
  return useContext(AwxActiveUserContext).refresh;
}
