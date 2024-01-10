import { useTranslation } from 'react-i18next';
import { DetailInfo } from '../../../../../framework/components/DetailInfo';

export function RepositoryAccess() {
  const { t } = useTranslation();

  return (
    <>
      <DetailInfo title={t('This should be one component for all Access tabs')} />
    </>
  );
}
