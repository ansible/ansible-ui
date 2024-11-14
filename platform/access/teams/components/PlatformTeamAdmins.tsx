import { LoadingPage, PageTable } from '@ansible/ansible-ui-framework';
import { AwxError } from '@ansible/awx-ui/common/AwxError';
import { ActionsResponse, OptionsResponse } from '@ansible/awx-ui/interfaces/OptionsResponse';
import { CubesIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { useGetItem } from '../../../../frontend/common/crud/useGet';
import { useOptions } from '../../../../frontend/common/crud/useOptions';
import { usePlatformView } from '../../../hooks/usePlatformView';
import { PlatformTeam } from '../../../interfaces/PlatformTeam';
import { PlatformUser } from '../../../interfaces/PlatformUser';
import { gatewayAPI } from '../../../utils/gateway-api-utils';
import { useUsersColumns } from '../../users/hooks/useUserColumns';
import { useUsersFilters } from '../../users/hooks/useUsersFilters';
import {
  useTeamAdminsRowActions,
  useTeamAdminsToolbarActions,
} from '../hooks/useTeamAdminsActions';

export function PlatformTeamAdmins() {
  const { t } = useTranslation();
  const toolbarFilters = useUsersFilters();
  const tableColumns = useUsersColumns();
  const params = useParams<{ id: string }>();
  const { data: team, isLoading, error } = useGetItem<PlatformTeam>(gatewayAPI`/teams`, params.id);

  const view = usePlatformView<PlatformUser>({
    url: gatewayAPI`/teams/${team?.id?.toString() ?? ''}/admins/`,
    toolbarFilters,
    tableColumns,
  });

  const { data: teamOptions, isLoading: isLoadingOptions } = useOptions<
    OptionsResponse<ActionsResponse>
  >(gatewayAPI`/teams/${team?.id?.toString() ?? ''}/`);
  const canEditTeam = Boolean(
    teamOptions &&
      teamOptions.actions &&
      (teamOptions.actions['PUT'] || teamOptions.actions['PATCH'])
  );
  const toolbarActions = useTeamAdminsToolbarActions(view);
  const rowActions = useTeamAdminsRowActions(view);

  if (isLoading || isLoadingOptions) return <LoadingPage />;
  if (error) return <AwxError error={error} />;

  return (
    <PageTable<PlatformUser>
      id="platform-admins-table"
      toolbarFilters={toolbarFilters}
      toolbarActions={toolbarActions}
      tableColumns={tableColumns}
      rowActions={rowActions}
      errorStateTitle={t('Error loading administrators')}
      emptyStateTitle={
        canEditTeam
          ? t('There are currently no administrators added to this team.')
          : t('You do not have permission to add an administrator to this team.')
      }
      emptyStateDescription={
        canEditTeam
          ? t('Add administrators by clicking the button below.')
          : t(
              'Please contact your organization administrator if there is an issue with your access.'
            )
      }
      emptyStateIcon={canEditTeam ? undefined : CubesIcon}
      emptyStateButtonText={canEditTeam ? t('Add administrators') : undefined}
      emptyStateActions={canEditTeam ? toolbarActions.slice(0, 1) : undefined}
      {...view}
    />
  );
}
