import { useTranslation } from 'react-i18next';

export function UserDetails() {
  const { t } = useTranslation();
  return <h1>{t('User details')}</h1>;
}
