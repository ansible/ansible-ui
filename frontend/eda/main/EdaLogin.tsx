import { Page } from '@patternfly/react-core';
import { mutate } from 'swr';
import { LoadingState } from '../../../framework/components/LoadingState';
import { Login } from '../../common/Login';
import { edaAPI } from '../common/eda-utils';
import { useEdaActiveUser } from '../common/useEdaActiveUser';

export function EdaLogin(props: { children: React.ReactNode }) {
  const { activeEdaUser, refreshActiveEdaUser } = useEdaActiveUser();

  if (activeEdaUser === undefined) {
    return (
      <Page>
        <LoadingState />
      </Page>
    );
  }

  if (!activeEdaUser) {
    return (
      <Login
        apiUrl={edaAPI`/auth/session/login/`}
        onSuccess={() => {
          refreshActiveEdaUser?.();
          void mutate(() => true);
        }}
      />
    );
  }

  return props.children;
}
