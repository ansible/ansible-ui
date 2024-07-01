import { Page } from '@patternfly/react-core';
import { mutate } from 'swr';
import { LoadingState } from '../../../framework/components/LoadingState';
import { Login } from '../../common/Login';
import { useHubActiveUser } from '../../hub/common/useHubActiveUser';
import { hubAPI } from '../common/api/formatPath';
import { HubContextProvider } from '../common/useHubContext';

export function HubLogin(props: { children: React.ReactNode }) {
  const { activeHubUser, refreshActiveHubUser } = useHubActiveUser();

  if (activeHubUser === undefined) {
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
        icon="/static/media/galaxy-logo.svg"
        brand={process.env.BRAND}
        product={process.env.PRODUCT}
      />
    );
  }

  return <HubContextProvider>{props.children}</HubContextProvider>;
}
