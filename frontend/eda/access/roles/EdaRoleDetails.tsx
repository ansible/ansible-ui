import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import {
  DateTimeCell,
  PageDetail,
  PageDetails,
  PageHeader,
  PageLayout,
  Scrollable,
  useGetPageUrl,
} from '../../../../framework';
import { useGet } from '../../../common/crud/useGet';
import { edaAPI } from '../../common/eda-utils';
import { EdaRole } from '../../interfaces/EdaRole';
import { EdaRoute } from '../../main/EdaRoutes';
import { EdaRolePermissions } from './components/EdaRolePermissions';

export function EdaRoleDetails() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const { data: role } = useGet<EdaRole>(edaAPI`/roles/${params.id ?? ''}/`);

  const getPageUrl = useGetPageUrl();

  return (
    <PageLayout>
      <PageHeader
        title={role?.name}
        breadcrumbs={[{ label: t('Roles'), to: getPageUrl(EdaRoute.Roles) }, { label: role?.name }]}
      />
      <Scrollable>
        <PageDetails>
          <PageDetail label={t('Name')}>{role?.name || ''}</PageDetail>
          <PageDetail label={t('Description')}>{role?.description || ''}</PageDetail>
          <PageDetail label={t('Created')}>
            <DateTimeCell value={role?.created_at} />
          </PageDetail>
        </PageDetails>
        <PageDetails numberOfColumns={'single'}>
          <PageDetail label={t('Permissions')}>
            <EdaRolePermissions role={role} />
          </PageDetail>
        </PageDetails>
      </Scrollable>
    </PageLayout>
  );
}
