import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { useGet } from '../../../../common/crud/useGet';
import { Role } from '../Role';
import { pulpAPI } from '../../../common/api/formatPath';
import {
  DateTimeCell,
  LoadingPage,
  PageDetail,
  PageDetails,
  PageHeader,
  PageLayout,
  Scrollable,
  useGetPageUrl,
} from '../../../../../framework';
import { HubRoute } from '../../../main/HubRoutes';
import { useLockedRolesWithDescription } from '../hooks/useLockedRolesWithDescription';
import { RolePermissions } from '../components/RolePermissions';
import { HubError } from '../../../common/HubError';
import { PulpItemsResponse } from '../../../common/useHubView';

export function RoleDetails() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const { data, error, refresh } = useGet<PulpItemsResponse<Role>>(
    pulpAPI`/roles/?name=${params.id}`
  );
  const role = data?.results?.[0];
  const getPageUrl = useGetPageUrl();
  const lockedRolesWithDescription = useLockedRolesWithDescription();

  if (error) return <HubError error={error} handleRefresh={refresh} />;
  if (!role) return <LoadingPage breadcrumbs tabs />;

  return (
    <PageLayout>
      <PageHeader
        title={role?.name}
        breadcrumbs={[{ label: t('Roles'), to: getPageUrl(HubRoute.Roles) }, { label: role?.name }]}
      />
      <Scrollable>
        <PageDetails>
          <PageDetail label={t('Name')}>{role.name || ''}</PageDetail>
          <PageDetail label={t('Description')}>
            {lockedRolesWithDescription[role.name] ?? role.description}
          </PageDetail>
          <PageDetail label={t('Created')}>
            <DateTimeCell format="date-time" value={role.pulp_created} />
          </PageDetail>
        </PageDetails>
        <PageDetails numberOfColumns={'single'}>
          <PageDetail label={t('Permissions')}>
            <RolePermissions role={role} showCustom={true} />
          </PageDetail>
        </PageDetails>
      </Scrollable>
    </PageLayout>
  );
}
