import { Page } from '@patternfly/react-core';
<<<<<<< HEAD
import useSWR, { mutate } from 'swr';
=======
import { useCallback } from 'react';
import useSWR from 'swr';
>>>>>>> 8269c803c (Login Flow Update (#1946))
import { LoadingState } from '../../../framework/components/LoadingState';
import { Login } from '../../common/Login';
import type { AuthOption } from '../../common/SocialAuthLogin';
import { requestGet } from '../../common/crud/Data';
<<<<<<< HEAD
import { awxAPI } from '../common/api/awx-utils';
import { useAwxActiveUser } from '../common/useAwxActiveUser';
import { AwxConfigProvider } from '../common/useAwxConfig';
import { WebSocketProvider } from '../common/useAwxWebSocket';
import ProductIcon from './awx-logo.svg';
=======
import { AwxItemsResponse } from '../common/AwxItemsResponse';
import { awxAPI } from '../common/api/awx-utils';
import { AwxActiveUserContext } from '../common/useAwxActiveUser';
import { AwxConfigProvider } from '../common/useAwxConfig';
import { WebSocketProvider } from '../common/useAwxWebSocket';
import { User } from '../interfaces/User';
>>>>>>> 8269c803c (Login Flow Update (#1946))

type AwxAuthOptions = {
  [key: string]: {
    login_url: string;
  };
};

export function AwxLogin(props: { children: React.ReactNode }) {
<<<<<<< HEAD
=======
  const response = useSWR<AwxItemsResponse<User>>(awxAPI`/me/`, requestGet, {
    dedupingInterval: 0,
    refreshInterval: 10 * 1000,
  });
  const onSuccessfulLogin = useCallback(() => void response.mutate(), [response]);

>>>>>>> 8269c803c (Login Flow Update (#1946))
  const { data: options } = useSWR<AwxAuthOptions>(awxAPI`/auth/`, requestGet);
  const authOptions: AuthOption[] = [];
  if (options && typeof options === 'object') {
    Object.keys(options).forEach((key) => {
      authOptions.push({ login_url: options[key].login_url, type: key });
    });
  }

<<<<<<< HEAD
  const { activeAwxUser, refreshActiveAwxUser } = useAwxActiveUser();

  if (activeAwxUser === undefined) {
=======
  if (response.isLoading) {
>>>>>>> 8269c803c (Login Flow Update (#1946))
    return (
      <Page>
        <LoadingState />
      </Page>
    );
  }

<<<<<<< HEAD
  if (!activeAwxUser) {
    return (
      <Login
        authOptions={authOptions}
        apiUrl="/api/login/"
        onSuccess={() => {
          refreshActiveAwxUser?.();
          void mutate(() => true);
        }}
        icon={<ProductIcon style={{ height: 64 }} />}
        brand={process.env.BRAND}
        product={process.env.PRODUCT}
      />
    );
  }

  return (
    <WebSocketProvider>
      <AwxConfigProvider>{props.children}</AwxConfigProvider>
    </WebSocketProvider>
=======
  if (!response.data || !response.data.results.length || response.error) {
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
>>>>>>> 8269c803c (Login Flow Update (#1946))
  );
}
