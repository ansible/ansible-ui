import { Page } from '@patternfly/react-core';
import { LoadingState } from '../../framework/components/LoadingState';
import { Login } from '../../frontend/common/Login';
import { gatewayAPI } from '../api/gateway-api-utils';
import { usePlatformActiveUser } from './PlatformActiveUserProvider';

export function PlatformLogin(props: { children: React.ReactNode }) {
  const { user, refresh, isLoading } = usePlatformActiveUser();

  if (isLoading) {
    return (
      <Page>
        <LoadingState />
      </Page>
    );
  }

  if (!user) {
    return <Login apiUrl={gatewayAPI`/login/`} onSuccess={() => void refresh?.()} />;
  }

  return props.children;
}
