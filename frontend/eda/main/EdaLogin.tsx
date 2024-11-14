import { LoadingState } from '@ansible/ansible-ui-framework/components/LoadingState';
import { AnsibleLogin } from '@ansible/common-ui/AnsibleLogin/AnsibleLogin';
import { Page } from '@patternfly/react-core';
import { mutate } from 'swr';
import { edaAPI } from '../common/eda-utils';
import { useEdaActiveUser } from '../common/useEdaActiveUser';

export function EdaLogin(props: { children: React.ReactNode }) {
  const { activeEdaUser, refreshActiveEdaUser } = useEdaActiveUser();

  if (activeEdaUser === undefined) {
    return (
      <Page>
        <LoadingState />
      </Page>
    );
  }

  if (!activeEdaUser) {
    return (
      <AnsibleLogin
        loginApiUrl={edaAPI`/auth/session/login/`}
        onSuccess={() => {
          refreshActiveEdaUser?.();
          void mutate(() => true);
        }}
        brandImg="/assets/eda-logo.svg"
        brandImgAlt={process.env.PRODUCT}
      />
    );
  }

  return props.children;
}
