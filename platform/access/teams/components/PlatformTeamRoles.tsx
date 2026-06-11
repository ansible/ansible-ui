import { LoadingPage, PageTable } from '@ansible/ansible-ui-framework';
import { AwxError } from '@ansible/awx-ui/common/AwxError';
import { ActionsResponse, OptionsResponse } from '@ansible/awx-ui/interfaces/OptionsResponse';
import { TeamAssignment } from '@ansible/common-ui/access/interfaces/TeamAssignment';
import { useOptions } from '@ansible/common-ui/crud/useOptions';
import { CubesIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { usePlatformView } from '../../../hooks/usePlatformView';
import { gatewayAPI } from '../../../utils/gateway-api-utils';
import { useGetResourceTypes } from '../../roles/hooks/useResourceType';
import { usePlatformUserRolesFilters } from '../../users/hooks/usePlatformUserRolesFilters';
import { useTeamRolesRowActions, useTeamRolesToolbarActions } from '../hooks/useTeamRolesActions';
import { useTeamRolesColumns } from '../hooks/useTeamRolesColumns';

export function PlatformTeamRoles() {
  const { t } = useTranslation();
  const { data: resourceTypeData } = useGetResourceTypes();
  const resourceTypeNames =
    resourceTypeData?.results?.map((resourceType) => ({
      name: resourceType.model,
      value: resourceType.api_slug,
      service: resourceType.service,
    })) ?? [];

  const toolbarFilters = usePlatformUserRolesFilters(resourceTypeNames);
  const baseTableColumns = useTeamRolesColumns({ disableLinks: false });
  const tableColumns = useMemo(
    () => baseTableColumns.map((column) => ({ ...column, sort: undefined })),
    [baseTableColumns]
  );
  const params = useParams<{ id: string }>();
  const view = usePlatformView<TeamAssignment>({
    url: gatewayAPI`/role_team_assignments/`,
    queryParams: {
      team_id: params?.id?.toString() ?? '',
    },
    toolbarFilters,
    tableColumns,
    disableQueryString: true,
  });

  const {
    data: teamOptions,
    isLoading,
    error,
  } = useOptions<OptionsResponse<ActionsResponse>>(
    gatewayAPI`/teams/${params?.id?.toString() ?? ''}/`
  );
  const canEditTeam = Boolean(
    teamOptions?.actions && (teamOptions.actions['PUT'] || teamOptions.actions['PATCH'])
  );
  const toolbarActions = useTeamRolesToolbarActions(view);
  const rowActions = useTeamRolesRowActions(view);

  if (isLoading) return <LoadingPage />;
  if (error) return <AwxError error={error} />;

  return (
    <PageTable<TeamAssignment>
      id="platform-team-roles-table"
      toolbarFilters={toolbarFilters}
      toolbarActions={toolbarActions}
      tableColumns={tableColumns}
      rowActions={rowActions}
      errorStateTitle={t('Error loading roles')}
      emptyStateTitle={
        canEditTeam
          ? t('No roles assigned to this team')
          : t('You do not have permission to assign a role to this team.')
      }
      emptyStateDescription={
        canEditTeam
          ? t(
              'To get started, assign roles to this team. All users assigned to this team will inherit these roles.'
            )
          : t(
              'Please contact your organization administrator if there is an issue with your access.'
            )
      }
      emptyStateIcon={canEditTeam ? undefined : CubesIcon}
      emptyStateButtonText={canEditTeam ? t('Assign roles') : undefined}
      emptyStateActions={canEditTeam ? toolbarActions.slice(0, 1) : undefined}
      {...view}
    />
  );
}
