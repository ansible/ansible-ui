import { createContext, useContext } from 'react';
import { EdaUser } from '../interfaces/EdaUser';

export const EdaActiveUserContext = createContext<{ user: EdaUser; refresh: () => void }>({
  user: {} as EdaUser,
  refresh: () => null,
});

export function useEdaActiveUser() {
  return useContext(EdaActiveUserContext).user;
}

export function useEdaRefreshUser() {
  return useContext(EdaActiveUserContext).refresh;
}
