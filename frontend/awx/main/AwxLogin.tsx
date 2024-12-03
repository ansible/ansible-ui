import { LoadingState } from '@ansible/ansible-ui-framework/components/LoadingState';
import { AnsibleLogin } from '@ansible/common-ui/AnsibleLogin/AnsibleLogin';
import type { AuthOption } from '@ansible/common-ui/SocialAuthLogin';
import { requestGet } from '@ansible/common-ui/crud/Data';
import { Page } from '@patternfly/react-core';
import { ReactNode } from 'react';
import useSWR, { mutate } from 'swr';
import { awxAPI } from '../common/api/awx-utils';
import { useAwxActiveUser } from '../common/useAwxActiveUser';
import { AwxConfigProvider } from '../common/useAwxConfig';
import { WebSocketProvider } from '../common/useAwxWebSocket';
import { DocsVersionProvider } from '@ansible/common-ui/utils/useDocsVersion';

type AwxAuthOptions = {
  [key: string]: {
    login_url: string;
  };
};

export function AwxLogin(props: {
  children: React.ReactNode;
  loginTitle?: string;
  loginApiUrl?: string;
  baseLoginUrl?: string;
  brandImg?: ReactNode;
  otherOptions?: { label: string; onClick: () => void }[];
}) {
  const { data: options } = useSWR<AwxAuthOptions>(awxAPI`/auth/`, requestGet);
  const authOptions: AuthOption[] = [];
  if (options && typeof options === 'object') {
    Object.keys(options).forEach((key) => {
      authOptions.push({
        login_url: props.baseLoginUrl
          ? `${props.baseLoginUrl}${options[key].login_url}`
          : options[key].login_url,
        type: key,
      });
    });
  }

  const { activeAwxUser, refreshActiveAwxUser } = useAwxActiveUser();

  if (activeAwxUser === undefined) {
    return (
      <Page>
        <LoadingState />
      </Page>
    );
  }

  if (!activeAwxUser) {
    return (
      <AnsibleLogin
        loginTitle={props.loginTitle}
        authOptions={authOptions}
        loginApiUrl={props.loginApiUrl ? props.loginApiUrl : '/api/login/'}
        onSuccess={() => {
          refreshActiveAwxUser?.();
          void mutate(() => true);
        }}
        brandImg={props.brandImg ? props.brandImg : '/assets/awx-logo.svg'}
        brandImgAlt={process.env.PRODUCT}
        otherOptions={props.otherOptions}
      />
    );
  }

  return (
    <DocsVersionProvider version={undefined}>
      <WebSocketProvider>
        <AwxConfigProvider>{props.children}</AwxConfigProvider>
      </WebSocketProvider>
    </DocsVersionProvider>
  );
}
