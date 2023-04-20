import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { PageDetail, PageDetails, PageHeader, PageLayout, Scrollable } from '../../../../framework';
import { RouteObj } from '../../../Routes';
import { useGet } from '../../../common/crud/useGet';
import { API_PREFIX } from '../../constants';
import { EdaRole } from '../../interfaces/EdaRole';

export function RoleDetails() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const { data: role } = useGet<EdaRole>(`${API_PREFIX}/roles/${params.id ?? ''}/`);

  return (
    <PageLayout>
      <PageHeader
        title={role?.name}
        breadcrumbs={[{ label: t('Roles'), to: RouteObj.EdaRoles }, { label: role?.name }]}
      />
      <Scrollable>
        <PageDetails>
          <PageDetail label={t('Name')}>{role?.name || ''}</PageDetail>
          <PageDetail label={t('Description')}>{role?.description || ''}</PageDetail>
        </PageDetails>
      </Scrollable>
    </PageLayout>
  );
}
