import { Page } from '@patternfly/react-core';

import useSWR, { mutate } from 'swr';
import { useCallback } from 'react';
import useSWR from 'swr';
import { LoadingState } from '../../../framework/components/LoadingState';
import { Login } from '../../common/Login';
import type { AuthOption } from '../../common/SocialAuthLogin';
import { requestGet } from '../../common/crud/Data';

import { awxAPI } from '../common/api/awx-utils';
import { useAwxActiveUser } from '../common/useAwxActiveUser';
import { AwxConfigProvider } from '../common/useAwxConfig';
import { WebSocketProvider } from '../common/useAwxWebSocket';
import ProductIcon from './awx-logo.svg';
import { AwxItemsResponse } from '../common/AwxItemsResponse';
import { awxAPI } from '../common/api/awx-utils';
import { useAwxActiveUser, useAwxActiveUserContext } from '../common/useAwxActiveUser';
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
  const onSuccessfulLogin = useCallback(() => void response.mutate(), [response]);

  const { data: options } = useSWR<AwxAuthOptions>(awxAPI`/auth/`, requestGet);
  const authOptions: AuthOption[] = [];
  if (options && typeof options === 'object') {
    Object.keys(options).forEach((key) => {
      authOptions.push({ login_url: options[key].login_url, type: key });
    });
  }


  const { activeAwxUser, refreshActiveAwxUser } = useAwxActiveUser();

  if (activeAwxUser === undefined) {
  if (response.isLoading) {

  const awxActiveUserContext = useAwxActiveUserContext();
  const awxActiveUser = useAwxActiveUser();

  if (awxActiveUserContext?.isLoading) {
    return (
      <Page>
        <LoadingState />
      </Page>
    );
  }


  if (!activeAwxUser) {
  if (!awxActiveUser) {
    return (
      <Login
        authOptions={authOptions}
        apiUrl="/api/login/"
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
        onSuccess={() => void awxActiveUserContext?.mutate()}
      />
    );
  }

  return (
    <WebSocketProvider>
      <AwxConfigProvider>{props.children}</AwxConfigProvider>
    </WebSocketProvider>
  );
}
