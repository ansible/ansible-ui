import { useTranslation } from 'react-i18next';
import { PageHeader } from '../../../framework';

export function UnderDevelopment() {
  const { t } = useTranslation();
  return <PageHeader title={t('Under Development')} />;
}
