import { Page } from '@patternfly/react-core';
import { mutate } from 'swr';
import { LoadingState } from '../../../framework/components/LoadingState';
import { AnsibleLogin } from '../../common/AnsibleLogin/AnsibleLogin';
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
      <AnsibleLogin
        loginApiUrl={hubAPI`/_ui/v1/auth/login/`}
        onSuccess={() => {
          refreshActiveHubUser?.();
          void mutate(() => true);
        }}
        brandImg="/assets/galaxy-logo.svg"
        brandImgAlt={process.env.PRODUCT}
      />
    );
  }

  return <HubContextProvider>{props.children}</HubContextProvider>;
}
