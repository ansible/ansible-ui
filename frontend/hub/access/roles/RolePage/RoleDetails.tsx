import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { useGetItem } from '../../../../common/crud/useGet';
import { Role } from '../Role';
import { pulpAPI } from '../../../api/formatPath';
import {
  DateTimeCell,
  PageDetail,
  PageDetails,
  PageHeader,
  PageLayout,
  Scrollable,
  useGetPageUrl,
} from '../../../../../framework';
import { HubRoute } from '../../../HubRoutes';
import { useLockedRolesWithDescription } from '../hooks/useLockedRolesWithDescription';
import { RolePermissions } from '../components/RolePermissions';

export function RoleDetails() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const { data: role } = useGetItem<Role>(pulpAPI`/roles`, params.id);
  const getPageUrl = useGetPageUrl();
  const lockedRolesWithDescription = useLockedRolesWithDescription();
  if (!role) {
    return null;
  }
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
