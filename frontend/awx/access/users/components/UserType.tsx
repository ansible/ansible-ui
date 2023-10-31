import { Text, Label } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';

export function UserType<
  T extends {
    is_superuser?: boolean | null;
    is_system_auditor?: boolean | null;
  },
>(props: { user: T }) {
  const { user } = props;
  const { t } = useTranslation();
  if (user.is_superuser) {
    return <Label>{t('System administrator')}</Label>;
  }
  if (user.is_system_auditor) {
    return <Label>{t('System auditor')}</Label>;
  }
  return <Text>{t('Normal user')}</Text>;
}
