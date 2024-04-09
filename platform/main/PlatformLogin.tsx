import { Page } from '@patternfly/react-core';
import { ReactNode } from 'react';
import { mutate } from 'swr';
import { LoadingState } from '../../framework/components/LoadingState';
import { Login } from '../../frontend/common/Login';
import { gatewayAPI } from '../api/gateway-api-utils';
import { usePlatformActiveUser } from './PlatformActiveUserProvider';

export function PlatformLogin(props: { children: ReactNode }) {
  const { activePlatformUser, refreshActivePlatformUser, activePlatformUserIsLoading } =
    usePlatformActiveUser();

  if (activePlatformUserIsLoading) {
    return (
      <Page>
        <LoadingState />
      </Page>
    );
  }

  if (!activePlatformUser) {
    return (
      <Login
        apiUrl={gatewayAPI`/login/`}
        onSuccess={() => {
          refreshActivePlatformUser?.();
          void mutate(() => true);
        }}
      />
    );
  }

  return props.children;
}
