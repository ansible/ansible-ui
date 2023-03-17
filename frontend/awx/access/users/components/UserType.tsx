import { Label } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { User } from '../../../interfaces/User';

export function UserType(props: { user: User }) {
  const { user } = props;
  const { t } = useTranslation();
  if (user.is_superuser) {
    return <Label>{t('System administrator')}</Label>;
  }
  if (user.is_system_auditor) {
    return <Label>{t('System auditor')}</Label>;
  }
  return <Label>{t('Normal user')}</Label>;
}
