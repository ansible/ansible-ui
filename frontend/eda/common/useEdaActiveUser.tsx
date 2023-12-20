import { ReactNode, createContext, useContext, useEffect, useState } from 'react';
import { useGet } from '../../common/crud/useGet';
import { edaAPI } from '../api/eda-utils';
import { EdaUser } from '../interfaces/EdaUser';

const EdaActiveUserContext = createContext<EdaUser | null | undefined>(undefined);

export function useEdaActiveUser() {
  return useContext(EdaActiveUserContext);
}

export function EdaActiveUserProvider(props: { children?: ReactNode }) {
  const [activeUser, setActiveUser] = useState<EdaUser | null | undefined>(undefined);
  const userResponse = useGet<EdaUser>(edaAPI`/users/me/`);
  useEffect(() => {
    if (userResponse.data) {
      setActiveUser(userResponse.data ?? null);
    }
  }, [userResponse.data]);
  return (
    <EdaActiveUserContext.Provider value={activeUser}>
      {props.children}
    </EdaActiveUserContext.Provider>
  );
}
