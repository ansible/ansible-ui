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
import { useHubActiveUser, useHubActiveUserContext } from '../../hub/common/useHubActiveUser';
import { hubAPI } from '../common/api/formatPath';
import { HubContextProvider } from '../common/useHubContext';

export function HubLogin(props: { children: React.ReactNode }) {
  const hubActiveUserContext = useHubActiveUserContext();
  const hubActiveUser = useHubActiveUser();

  if (response.isLoading) {
  if (hubActiveUserContext?.isLoading) {
    return (
      <Page>
        <LoadingState />
      </Page>
    );
  }


  if (!activeHubUser) {
    return (
      <Login
        apiUrl={hubAPI`/_ui/v1/auth/login/`}
        onSuccess={() => {
          refreshActiveHubUser?.();
          void mutate(() => true);
        }}
        icon={<ProductIcon style={{ maxWidth: 64, maxHeight: 64 }} />}
        brand={process.env.BRAND}
        product={process.env.PRODUCT}
      />
    );
  }

  return <HubContextProvider>{props.children}</HubContextProvider>;
=======
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
    return (
      <Login
        apiUrl={hubAPI`/_ui/v1/auth/login/`}
        onSuccess={() => void hubActiveUserContext?.mutate()}
      />
    );
  }

  return <HubContextProvider>{props.children}</HubContextProvider>;
}
