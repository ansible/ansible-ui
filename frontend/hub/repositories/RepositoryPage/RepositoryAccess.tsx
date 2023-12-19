import { DetailInfo } from '../../../../framework/components/DetailInfo';
import { useTranslation } from 'react-i18next';

export function RepositoryAccess() {
  const { t } = useTranslation();

  return (
    <>
      <DetailInfo title={t('This should be one component for all Access tabs')} />
    </>
  );
}
