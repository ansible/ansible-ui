import { Page } from '@patternfly/react-core';
import { LoadingState } from '../../framework/components/LoadingState';
import { Login } from '../../frontend/common/Login';
import { gatewayAPI } from '../api/gateway-api-utils';
import { usePlatformActiveUser, usePlatformActiveUserContext } from './PlatformActiveUserProvider';

export function PlatformLogin(props: { children: React.ReactNode }) {
  const platformActiveUserContext = usePlatformActiveUserContext();
  const platformActiveUser = usePlatformActiveUser();

  if (platformActiveUserContext?.isLoading) {
    return (
      <Page>
        <LoadingState />
      </Page>
    );
  }

  if (!platformActiveUser) {
    return (
      <Login
        apiUrl={gatewayAPI`/login/`}
        onSuccess={() => void platformActiveUserContext?.mutate()}
      />
    );
  }

  return props.children;
}
