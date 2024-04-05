import { Page } from '@patternfly/react-core';
import { useCallback } from 'react';
import useSWR from 'swr';
import { LoadingState } from '../../../framework/components/LoadingState';
import { Login } from '../../common/Login';
import { requestGet } from '../../common/crud/Data';
import { edaAPI } from '../common/eda-utils';
import { EdaActiveUserContext } from '../common/useEdaActiveUser';
import { EdaUser } from '../interfaces/EdaUser';

export function EdaLogin(props: { children: React.ReactNode }) {
  const response = useSWR<EdaUser>(edaAPI`/users/me/`, requestGet);
  const onSuccessfulLogin = useCallback(() => void response.mutate(), [response]);

  if (!response.data) {
    if (response.error) {
      return <Login apiUrl={edaAPI`/auth/session/login/`} onSuccess={onSuccessfulLogin} />;
    }

    if (response.isLoading) {
      return (
        <Page>
          <LoadingState />
        </Page>
      );
    }

    return <Login apiUrl={edaAPI`/auth/session/login/`} onSuccess={onSuccessfulLogin} />;
  }

  return (
    <EdaActiveUserContext.Provider
      value={{ user: response.data, refresh: () => void response.mutate(undefined) }}
    >
      {props.children}
    </EdaActiveUserContext.Provider>
  );
}
