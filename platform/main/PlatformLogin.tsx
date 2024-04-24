import { Page } from '@patternfly/react-core';
import { t } from 'i18next';
import { ReactNode } from 'react';
import { mutate } from 'swr';
import { LoadingState } from '../../framework/components/LoadingState';
import { Login } from '../../frontend/common/Login';
import { useGet } from '../../frontend/common/crud/useGet';
import { gatewayAPI } from '../api/gateway-api-utils';
import RedHatIcon from '../icons/redhat-icon.svg';
import { UIAuth } from '../interfaces/UIAuth';
// import LoginBackgroundDark from './LoginBackgroundDark.svg';
// import LoginBackgroundLight from './LoginBackgroundLight.svg';
import { usePlatformActiveUser } from './PlatformActiveUserProvider';

export function PlatformLogin(props: { children: ReactNode }) {
  const { activePlatformUser, refreshActivePlatformUser } = usePlatformActiveUser();
  const { data: options } = useGet<UIAuth>(gatewayAPI`/ui_auth/`);
  const hideInputs = options ? !options.show_login_form : false;
  // const { activeTheme } = usePageSettings();

  if (activePlatformUser === undefined) {
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
        loginDescription={t('Enter your single sign-on credentials.')}
        icon={<RedHatIcon style={{ maxHeight: 64, maxWidth: 64 }} />}
        brand={t('Red Hat')}
        product={t('Ansible Automation Platform')}
        // background={activeTheme === 'light' ? <LoginBackgroundLight /> : <LoginBackgroundDark />}
      />
    );
  }

  return props.children;
}
