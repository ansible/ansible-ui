import { Page } from '@patternfly/react-core';
import { ReactNode, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { mutate } from 'swr';
import { LoadingState } from '../../framework/components/LoadingState';
import { AnsibleLogin } from '../../frontend/common/AnsibleLogin/AnsibleLogin';
import { useGet } from '../../frontend/common/crud/useGet';
import { AwxLogin } from '../../frontend/awx/main/AwxLogin';
import { HubLogin } from '../../frontend/hub/main/HubLogin';
import AAPLogo from '../assets/aap-logo.svg';
import { UIAuth } from '../interfaces/UIAuth';
import { gatewayAPI } from '../utils/gateway-api-utils';
import { usePlatformActiveUser } from './PlatformActiveUserProvider';

export function PlatformLogin(props: { children: ReactNode }) {
  const { activePlatformUser } = usePlatformActiveUser();
  const { data: options } = useGet<UIAuth>(gatewayAPI`/ui_auth/`);
  const hideAuthOptions = options ? !options.show_login_form : false;
  const hideLegacyAuthOptions = options ? !options?.legacy_auth_enabled : false;

  const { t } = useTranslation();

  const [mode, setModeState] = useState<'aap' | 'awx' | 'hub'>('aap');

  useEffect(() => {
    if (activePlatformUser) {
      setModeState('aap');
    }
  }, [activePlatformUser]);

  if (activePlatformUser === undefined) {
    return (
      <Page>
        <LoadingState />
      </Page>
    );
  }

  if (mode === 'awx') {
    return (
      <AwxLogin
        loginApiUrl={gatewayAPI`/legacy_auth/controller_password/`}
        baseLoginUrl={options?.legacy_controller_sso_url}
        loginTitle={t('Log in to Automation Controller and migrate your account')}
        otherOptions={[
          {
            label: t('Switch to Ansible Automation Platform login'),
            onClick: () => setModeState('aap'),
          },
        ]}
      >
        {props.children}
      </AwxLogin>
    );
  } else if (mode === 'hub') {
    return (
      <HubLogin
        loginApiUrl={gatewayAPI`/legacy_auth/hub_password/`}
        baseLoginUrl={options?.legacy_automation_hub_sso_url}
        loginTitle={t('Log in to Automation Hub and migrate your account')}
        otherOptions={[
          {
            label: t('Switch to Ansible Automation Platform login'),
            onClick: () => setModeState('aap'),
          },
        ]}
      >
        {props.children}
      </HubLogin>
    );
  } else {
    if (!activePlatformUser) {
      return (
        <AnsibleLogin
          loginApiUrl={gatewayAPI`/login/`}
          onSuccess={() => void mutate(() => true, undefined)}
          otherOptions={
            hideLegacyAuthOptions
              ? undefined
              : [
                  {
                    label: t('I have an Automation Controller account'),
                    onClick: () => setModeState('awx'),
                  },
                  {
                    label: t('I have an Automation Hub account'),
                    onClick: () => setModeState('hub'),
                  },
                ]
          }
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
  }

  return props.children;
}
