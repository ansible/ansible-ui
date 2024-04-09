import { Page } from '@patternfly/react-core';
import { ReactNode } from 'react';
import { mutate } from 'swr';
import { LoadingState } from '../../framework/components/LoadingState';
import { Login } from '../../frontend/common/Login';
import { useGet } from '../../frontend/common/crud/useGet';
import { gatewayAPI } from '../api/gateway-api-utils';
import { UIAuth } from '../interfaces/UIAuth';
import { usePlatformActiveUser } from './PlatformActiveUserProvider';

export function PlatformLogin(props: { children: ReactNode }) {
  const { activePlatformUser, refreshActivePlatformUser, activePlatformUserIsLoading } =
    usePlatformActiveUser();
  const { data: options } = useGet<UIAuth>(gatewayAPI`/ui_auth/`);
  const hideInputs = options ? !options.show_login_form : false;

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
        hideInputs={hideInputs}
        authOptions={options?.ssos}
      />
    );
  }

  return props.children;
}
