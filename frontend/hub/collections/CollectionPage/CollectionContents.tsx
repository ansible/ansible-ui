import { useTranslation } from 'react-i18next';
import { DetailInfo } from '../../../../framework/components/DetailInfo';

export function CollectionContents() {
  const { t } = useTranslation();
  return <DetailInfo title={t('This page is under construction')} />;
}
