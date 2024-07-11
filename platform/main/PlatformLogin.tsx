import { Page } from '@patternfly/react-core';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { mutate } from 'swr';
import { LoadingState } from '../../framework/components/LoadingState';
import { AnsibleLogin } from '../../frontend/common/AnsibleLogin';
import { useGet } from '../../frontend/common/crud/useGet';
import { gatewayAPI } from '../api/gateway-api-utils';
import AAPLogo from '../assets/aap-logo.svg';
import { UIAuth } from '../interfaces/UIAuth';
import { usePlatformActiveUser } from './PlatformActiveUserProvider';

export function PlatformLogin(props: { children: ReactNode }) {
  const { activePlatformUser } = usePlatformActiveUser();
  const { data: options } = useGet<UIAuth>(gatewayAPI`/ui_auth/`);
  const hideAuthOptions = options ? !options.show_login_form : false;
  const { t } = useTranslation();

  if (activePlatformUser === undefined) {
    return (
      <Page>
        <LoadingState />
      </Page>
    );
  }

  if (!activePlatformUser) {
    return (
      <AnsibleLogin
        loginApiUrl={gatewayAPI`/login/`}
        onSuccess={() => void mutate(() => true, undefined)}
        authOptions={hideAuthOptions ? undefined : options?.ssos}
        brandImg={
          options?.custom_logo ? (
            <img src={options.custom_logo} alt={t('Custom logo')} style={{ height: 64 }} />
          ) : (
            <AAPLogo style={{ height: 64 }} />
          )
        }
        brandImgAlt={process.env.PRODUCT}
        textContent={options?.custom_login_info}
        loginSubtitle={t('Enter your credentials.')}
      />
    );
  }

  return props.children;
}
