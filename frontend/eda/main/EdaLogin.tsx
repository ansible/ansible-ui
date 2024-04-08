import { Page } from '@patternfly/react-core';
import { LoadingState } from '../../../framework/components/LoadingState';
import { Login } from '../../common/Login';
import { edaAPI } from '../common/eda-utils';
import { useEdaActiveUser, useEdaActiveUserContext } from '../common/useEdaActiveUser';

export function EdaLogin(props: { children: React.ReactNode }) {
  const edaActiveUserContext = useEdaActiveUserContext();
  const edaActiveUser = useEdaActiveUser();

  if (edaActiveUserContext?.isLoading) {
    return (
      <Page>
        <LoadingState />
      </Page>
    );
  }

  if (!edaActiveUser) {
    return (
      <Login
        apiUrl={edaAPI`/auth/session/login/`}
        onSuccess={() => void edaActiveUserContext?.mutate()}
      />
    );
  }

  return props.children;
}
