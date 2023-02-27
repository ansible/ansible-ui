import { Text } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { pfWarning } from '../../../../../framework';
import { User } from '../../../interfaces/User';

export function UserType(props: { user: User }) {
  const { user } = props;
  const { t } = useTranslation();
  if (user.is_superuser)
    return <Text style={{ color: pfWarning }}>{t('System administrator')}</Text>;
  if (user.is_system_auditor)
    return <Text style={{ color: pfWarning }}>{t('System auditor')}</Text>;
  return <Text>{t('Normal user')}</Text>;
}
