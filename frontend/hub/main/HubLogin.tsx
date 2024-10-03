import { ReactNode } from 'react';
import { Page } from '@patternfly/react-core';
import useSWR, { mutate } from 'swr';
import { LoadingState } from '../../../framework/components/LoadingState';
import { AnsibleLogin } from '../../common/AnsibleLogin/AnsibleLogin';
import { requestGet } from '../../common/crud/Data';
import { useHubActiveUser } from '../../hub/common/useHubActiveUser';
import { hubAPI } from '../common/api/formatPath';
import { HubContextProvider } from '../common/useHubContext';

type HubAuthOptions = {
  KEYCLOAK_URL: string;
};

export function HubLogin(props: {
  children: React.ReactNode;
  loginTitle?: string;
  loginApiUrl?: string;
  baseLoginUrl?: string;
  brandImg?: ReactNode;
  otherOptions?: { label: string; onClick: () => void }[];
}) {
  const { data: options } = useSWR<HubAuthOptions>(hubAPI`/_ui/v1/settings/`, requestGet);
  const authOptions = options?.KEYCLOAK_URL
    ? [
        {
          name: 'Keycloak',
          login_url: props.baseLoginUrl
            ? `${props.baseLoginUrl}/login/keycloak/`
            : options.KEYCLOAK_URL,
          type: 'keycloak',
        },
      ]
    : undefined;

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
        loginTitle={props.loginTitle}
        authOptions={authOptions}
        loginApiUrl={props.loginApiUrl ? props.loginApiUrl : hubAPI`/_ui/v1/auth/login/`}
        onSuccess={() => {
          refreshActiveHubUser?.();
          void mutate(() => true);
        }}
        brandImg={props.brandImg ? props.brandImg : '/assets/galaxy-logo.svg'}
        brandImgAlt={process.env.PRODUCT}
        otherOptions={props.otherOptions}
      />
    );
  }

  return <HubContextProvider>{props.children}</HubContextProvider>;
}
