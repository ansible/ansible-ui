import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { DateTimeCell, PageDetail, PageDetails } from '../../../../../framework';
import { LoadingPage } from '../../../../../framework/components/LoadingPage';
import { LastModifiedPageDetail } from '../../../../common/LastModifiedPageDetail';
import { useGetItem } from '../../../../common/crud/useGet';
import { EdaOrganization } from '../../../interfaces/EdaOrganization';
import { edaAPI } from '../../../common/eda-utils';

export function OrganizationDetails() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const { data: organization } = useGetItem<EdaOrganization>(edaAPI`/organizations/`, params.id);

  if (!organization) {
    return <LoadingPage />;
  }

  return (
    <PageDetails>
      <PageDetail label={t('Name')}>{organization.name}</PageDetail>
      <PageDetail label={t('Description')}>{organization.description}</PageDetail>
      <PageDetail label={t('Created')}>
        <DateTimeCell value={organization.created} />
      </PageDetail>
      <LastModifiedPageDetail value={organization.modified} />
    </PageDetails>
  );
}
