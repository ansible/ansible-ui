import { Label } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { User } from '../../../interfaces/User';

export function AuthenticationType(props: { user: User }) {
  const { user } = props;
  const { t } = useTranslation();
  if (user.ldap_dn) {
    return <Label>{t('LDAP')}</Label>;
  }
  if (user.auth.length > 0) {
    return <Label>{t('Social')}</Label>;
  }
  return <Label>{t('Local')}</Label>;
}
