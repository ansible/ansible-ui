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
import { usePlatformActiveUser } from './PlatformActiveUserProvider';

export function PlatformLogin(props: { children: ReactNode }) {
  const { activePlatformUser } = usePlatformActiveUser();
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
        onSuccess={() => void mutate(() => true, undefined)}
        hideInputs={hideInputs}
        authOptions={options?.ssos}
        loginDescription={t('Enter your credentials.')}
        icon={
          options?.custom_logo ? (
            <img
              src={options.custom_logo}
              alt="Custom logo"
              style={{ maxHeight: 64, maxWidth: 64 }}
            />
          ) : (
            <RedHatIcon style={{ maxHeight: 64, maxWidth: 64 }} />
          )
        }
        brand={t('Red Hat')}
        product={t('Ansible Automation Platform')}
        productDescription={options?.custom_login_info}
      />
    );
  }

  return props.children;
}
