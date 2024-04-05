import { Page } from '@patternfly/react-core';
import { useCallback } from 'react';
import useSWR from 'swr';
import { LoadingState } from '../../../framework/components/LoadingState';
import { Login } from '../../common/Login';
import type { AuthOption } from '../../common/SocialAuthLogin';
import { requestGet } from '../../common/crud/Data';
import { AwxItemsResponse } from '../common/AwxItemsResponse';
import { awxAPI } from '../common/api/awx-utils';
import { AwxActiveUserContext } from '../common/useAwxActiveUser';
import { AwxConfigProvider } from '../common/useAwxConfig';
import { WebSocketProvider } from '../common/useAwxWebSocket';
import { User } from '../interfaces/User';

type AwxAuthOptions = {
  [key: string]: {
    login_url: string;
  };
};

export function AwxLogin(props: { children: React.ReactNode }) {
  const response = useSWR<AwxItemsResponse<User>>(awxAPI`/me/`, requestGet, {
    dedupingInterval: 0,
    refreshInterval: 10 * 1000,
  });
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

  const onSuccessfulLogin = useCallback(() => void response.mutate(), [response]);

  if (!response.data || !response.data.results.length) {
    if (response.error) {
      return <Login authOptions={authOptions} apiUrl="/api/login/" onSuccess={onSuccessfulLogin} />;
    }

    if (response.isLoading) {
      return (
        <Page>
          <LoadingState />
        </Page>
      );
    }

    return <Login authOptions={authOptions} apiUrl="/api/login/" onSuccess={onSuccessfulLogin} />;
  }

  return (
    <AwxActiveUserContext.Provider
      value={{ user: response.data.results[0], refresh: () => void response.mutate() }}
    >
      <WebSocketProvider>
        <AwxConfigProvider>{props.children}</AwxConfigProvider>
      </WebSocketProvider>
    </AwxActiveUserContext.Provider>
  );
}
