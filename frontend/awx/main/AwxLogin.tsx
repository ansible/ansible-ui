import { Page } from '@patternfly/react-core';
import useSWR from 'swr';
import { LoadingState } from '../../../framework/components/LoadingState';
import { Login } from '../../common/Login';
import type { AuthOption } from '../../common/SocialAuthLogin';
import { requestGet } from '../../common/crud/Data';
import { awxAPI } from '../common/api/awx-utils';
import { useAwxActiveUser } from '../common/useAwxActiveUser';
import { AwxConfigProvider } from '../common/useAwxConfig';
import { WebSocketProvider } from '../common/useAwxWebSocket';

type AwxAuthOptions = {
  [key: string]: {
    login_url: string;
  };
};

export function AwxLogin(props: { children: React.ReactNode }) {
  const { data: options } = useSWR<AwxAuthOptions>(awxAPI`/auth/`, requestGet);
  const authOptions: AuthOption[] = [];
  if (options) {
    Object.keys(options).forEach((key) => {
      authOptions.push({
        login_url: options[key].login_url,
        type: key,
      });
    });
  }

  const { activeAwxUser, activeAwxUserIsLoading, refreshActiveAwxUser } = useAwxActiveUser();

  if (activeAwxUserIsLoading) {
    return (
      <Page>
        <LoadingState />
      </Page>
    );
  }

  if (!activeAwxUser) {
    return (
      <Login
        authOptions={authOptions}
        apiUrl="/api/login/"
        onSuccess={() => refreshActiveAwxUser?.()}
      />
    );
  }

  return (
    <WebSocketProvider>
      <AwxConfigProvider>{props.children}</AwxConfigProvider>
    </WebSocketProvider>
  );
}
