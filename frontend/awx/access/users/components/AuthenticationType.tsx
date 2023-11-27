import { Label } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';

export function AuthenticationType<T extends { ldap_dn?: string; auth?: string[] }>(props: {
  user: T;
}) {
  const { user } = props;
  const { t } = useTranslation();
  if (user.ldap_dn) {
    return <Label>{t('LDAP')}</Label>;
  }
  if (user.auth && user.auth.length > 0) {
    return <Label>{t('Social')}</Label>;
  }
  return <Label>{t('Local')}</Label>;
}
