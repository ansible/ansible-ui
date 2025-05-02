import { DateTimeCell, PageDetail, PageDetails } from '@ansible/ansible-ui-framework';
import { LoadingPage } from '@ansible/ansible-ui-framework/components/LoadingPage';
import { LastModifiedPageDetail } from '@ansible/common-ui/LastModifiedPageDetail';
import { useGetItem } from '@ansible/common-ui/crud/useGet';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
import { edaAPI } from '../../../common/eda-utils';
import { EdaOrganization } from '../../../interfaces/EdaOrganization';

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
