import { LoadingPage, PageDetails, PageTable } from '@ansible/ansible-ui-framework';
import { AwxError } from '@ansible/awx-ui/common/AwxError';
import { ActionsResponse, OptionsResponse } from '@ansible/awx-ui/interfaces/OptionsResponse';
import { UserAssignment } from '@ansible/common-ui/access/interfaces/UserAssignment';
import { useGet } from '@ansible/common-ui/crud/useGet';
import { useOptions } from '@ansible/common-ui/crud/useOptions';
import { CubesIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
import { usePlatformView } from '../../../hooks/usePlatformView';
import { PlatformUser } from '../../../interfaces/PlatformUser';
import { gatewayAPI } from '../../../utils/gateway-api-utils';
import { IndirectlyAssignedRolesAlert } from '../../common/IndirectlyAssignedRolesAlert';
import { useGetResourceTypes } from '../../roles/hooks/useResourceType';
import { usePlatformUserRolesColumns } from '../hooks/usePlatformUserRolesColumns';
import { usePlatformUserRolesFilters } from '../hooks/usePlatformUserRolesFilters';
import { usePlatformUserRolesRowActions } from '../hooks/usePlatformUserRolesRowActions';
import { usePlatformUserRolesToolbarActions } from '../hooks/usePlatformUserRolesToolbarActions';

export function PlatformUserRoles() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();

  const { data: resourceTypeData } = useGetResourceTypes();
  const resourceTypeNames =
    resourceTypeData?.results?.map((resourceType) => ({
      name: resourceType.model,
      value: resourceType.api_slug,
      service: resourceType.service,
    })) ?? [];

  const toolbarFilters = usePlatformUserRolesFilters(resourceTypeNames);
  const tableColumns = usePlatformUserRolesColumns();

  const view = usePlatformView<UserAssignment>({
    url: gatewayAPI`/role_user_assignments/`,
    toolbarFilters,
    tableColumns,
    queryParams: {
      user_id: params.id || '',
    },
    disableQueryString: true,
  });

  const { data: user } = useGet<PlatformUser>(gatewayAPI`/users/${params.id || ''}/`);

  const {
    data: userOptions,
    isLoading,
    error,
  } = useOptions<OptionsResponse<ActionsResponse>>(
    gatewayAPI`/users/${params?.id?.toString() ?? ''}/`
  );
  const canEditUser = Boolean(
    userOptions?.actions && (userOptions.actions['PUT'] || userOptions.actions['PATCH'])
  );

  const toolbarActions = usePlatformUserRolesToolbarActions(view);
  const rowActions = usePlatformUserRolesRowActions(view);

  if (isLoading) return <LoadingPage />;
  if (error) return <AwxError error={error} />;

  return (
    <PageDetails numberOfColumns={'single'} disablePadding>
      {(view?.itemCount ?? 0) > 0 && (
        <IndirectlyAssignedRolesAlert
          userId={params.id ?? ''}
          username={user?.username ?? ''}
          isUsersRoles={true}
        />
      )}
      <PageTable<UserAssignment>
        {...view}
        tableColumns={tableColumns}
        toolbarActions={toolbarActions}
        rowActions={rowActions}
        toolbarFilters={toolbarFilters}
        errorStateTitle={t('Error loading roles')}
        emptyStateTitle={
          canEditUser
            ? t('No roles assigned to this user.')
            : t('You do not have permission to assign a role to this user.')
        }
        emptyStateDescription={
          canEditUser
            ? t('To get started, assign roles to this user.')
            : t(
                'Please contact your organization administrator if there is an issue with your access.'
              )
        }
        emptyStateIcon={canEditUser ? undefined : CubesIcon}
        emptyStateButtonText={canEditUser ? t('Assign roles') : undefined}
        emptyStateActions={canEditUser ? toolbarActions.slice(0, 1) : undefined}
        disableCardView
        disableListView
      />
    </PageDetails>
  );
}
