import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import {
  DateTimeCell,
  LoadingPage,
  PageDetail,
  PageDetails,
  PageLayout,
  Scrollable,
  useGetPageUrl,
} from '../../../../../framework';
import { useGet } from '../../../../common/crud/useGet';
import { hubAPI } from '../../../common/api/formatPath';
import { HubError } from '../../../common/HubError';
import { HubRoute } from '../../../main/HubRoutes';
import { HubRolePermissions } from '../components/HubRolePermissions';
import { HubRbacRole } from '../../../interfaces/expanded/HubRbacRole';
import { useManagedRolesWithDescription } from '../hooks/useManagedRolesWithDescription';

export function HubRoleDetails() {
  const { t } = useTranslation();
  const history = useNavigate();
  const getPageUrl = useGetPageUrl();
  const params = useParams<{ id: string }>();
  const {
    data: role,
    error,
    refresh,
  } = useGet<HubRbacRole>(hubAPI`/_ui/v2/role_definitions/${params.id ?? ''}/`);
  const managedRolesWithDescription = useManagedRolesWithDescription();

  if (error) return <HubError error={error} handleRefresh={refresh} />;
  if (!role) return <LoadingPage breadcrumbs tabs />;

  return (
    <PageLayout>
      <Scrollable>
        <PageDetails disableScroll={true}>
          <PageDetail label={t('Name')}>{role?.name || ''}</PageDetail>
          <PageDetail label={t('Description')}>
            {managedRolesWithDescription[role?.name] || role?.description || ''}
          </PageDetail>
          <PageDetail label={t('Created')}>
            <DateTimeCell
              value={role?.created}
              author={role?.summary_fields?.created_by?.username}
              onClick={() =>
                history(
                  getPageUrl(HubRoute.UserDetails, {
                    params: {
                      id: (role.summary_fields?.created_by?.username ?? 0).toString(),
                    },
                  })
                )
              }
            />
          </PageDetail>
          <PageDetail label={t('Modified')}>
            <DateTimeCell value={role?.modified} />
          </PageDetail>
          <PageDetail label={t('Editable')}>
            {role?.managed ? t('Built-in') : t('Editable')}
          </PageDetail>
        </PageDetails>
        <PageDetails disableScroll={true} numberOfColumns={'single'}>
          <PageDetail label={t('Permissions')}>
            <HubRolePermissions role={role} />
          </PageDetail>
        </PageDetails>
      </Scrollable>
    </PageLayout>
  );
}
