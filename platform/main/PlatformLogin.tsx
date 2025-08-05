import { LoadingState } from '@ansible/ansible-ui-framework/components/LoadingState';
import { AnsibleLogin } from '@ansible/common-ui/AnsibleLogin/AnsibleLogin';
import { useGet } from '@ansible/common-ui/crud/useGet';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { mutate } from 'swr';
import AAPLogo from '../assets/aap-logo.svg?react';
import { UIAuth } from '../interfaces/UIAuth';
import { gatewayAPI } from '../utils/gateway-api-utils';
import { usePlatformActiveUser } from './PlatformActiveUserProvider';

export function PlatformLogin(props: { children: ReactNode }) {
  const { activePlatformUser } = usePlatformActiveUser();
  const { data: options } = useGet<UIAuth>(gatewayAPI`/ui_auth/`);
  const { t } = useTranslation();
  const brandImg = options?.custom_logo ? (
    <img src={options.custom_logo} alt={t('Custom logo')} style={{ height: 64 }} />
  ) : (
    <AAPLogo style={{ height: 64, color: 'white' }} />
  );

  if (activePlatformUser === undefined || options === undefined) {
    return <LoadingState />;
  }

  if (!activePlatformUser) {
    return (
      <AnsibleLogin
        loginApiUrl={gatewayAPI`/login/`}
        onSuccess={() => void mutate(() => true, undefined)}
        authOptions={options && options?.ssos.length > 0 ? options?.ssos : undefined}
        showLoginForm={options?.show_login_form ?? true}
        externalLoginUrl={options?.login_redirect_override}
        brandImg={brandImg}
        brandImgAlt={process.env.PRODUCT as unknown as string}
        textContent={options?.custom_login_info}
        loginSubtitle={t('Enter your credentials.')}
      />
    );
  }

  return props.children;
}
