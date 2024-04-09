import { Page } from '@patternfly/react-core';

import { mutate } from 'swr';
import { LoadingState } from '../../../framework/components/LoadingState';
import { Login } from '../../common/Login';
import { useHubActiveUser } from '../../hub/common/useHubActiveUser';
import { hubAPI } from '../common/api/formatPath';
import { HubContextProvider } from '../common/useHubContext';
import ProductIcon from './galaxy-logo.svg';

export function HubLogin(props: { children: React.ReactNode }) {
  const { activeHubUser, refreshActiveHubUser } = useHubActiveUser();

  if (activeHubUser === undefined) {
import { useCallback } from 'react';
import useSWR from 'swr';
import { LoadingState } from '../../../framework/components/LoadingState';
import { Login } from '../../common/Login';
import { useHubActiveUser } from '../../hub/common/useHubActiveUser';
import { hubAPI } from '../common/api/formatPath';
import { HubContextProvider } from '../common/useHubContext';

export function HubLogin(props: { children: React.ReactNode }) {
  const { activeHubUser, refreshActiveHubUser, activeHubUserIsLoading } = useHubActiveUser();

  if (activeHubUserIsLoading) {
    return (
      <Page>
        <LoadingState />
      </Page>
    );
  }

  if (!response.data || response.error) {
    return <Login apiUrl={hubAPI`/_ui/v1/auth/login/`} onSuccess={onSuccessfulLogin} />;
  }

  return (
    <HubActiveUserContext.Provider
      value={{ user: response.data, refresh: () => void response.mutate(undefined) }}
    >
      <HubContextProvider>{props.children}</HubContextProvider>
    </HubActiveUserContext.Provider>
  );

  if (!hubActiveUser) {
  if (!activeHubUser) {
    return (
      <Login apiUrl={hubAPI`/_ui/v1/auth/login/`} onSuccess={() => refreshActiveHubUser?.()} />
    );
  }

  return <HubContextProvider>{props.children}</HubContextProvider>;
}
