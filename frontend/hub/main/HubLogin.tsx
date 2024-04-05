import { Page } from '@patternfly/react-core';
import { LoadingState } from '../../../framework/components/LoadingState';
import { Login } from '../../common/Login';
import { useHubActiveUser, useHubActiveUserContext } from '../../hub/common/useHubActiveUser';
import { hubAPI } from '../common/api/formatPath';
import { HubContextProvider } from '../common/useHubContext';

export function HubLogin(props: { children: React.ReactNode }) {
  const hubActiveUserContext = useHubActiveUserContext();
  const hubActiveUser = useHubActiveUser();

  if (hubActiveUserContext.isLoading) {
    return (
      <Page>
        <LoadingState />
      </Page>
    );
  }

  if (!hubActiveUser) {
    return (
      <Login
        apiUrl={hubAPI`/_ui/v1/auth/login/`}
        onSuccess={() => void hubActiveUserContext.mutate()}
      />
    );
  }

  return <HubContextProvider>{props.children}</HubContextProvider>;
}
