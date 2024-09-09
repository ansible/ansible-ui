import { CubesIcon, PlusCircleIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { PageTable, usePageNavigate } from '../../../../framework';
import { AwxError } from '../../../../frontend/awx/common/AwxError';
import {
  ActionsResponse,
  OptionsResponse,
} from '../../../../frontend/awx/interfaces/OptionsResponse';
import { useGetItem } from '../../../../frontend/common/crud/useGet';
import { useOptions } from '../../../../frontend/common/crud/useOptions';
import { usePlatformView } from '../../../hooks/usePlatformView';
import { PlatformTeam } from '../../../interfaces/PlatformTeam';
import { gatewayAPI } from '../../../utils/gateway-api-utils';

import { LoadingState } from '../../../../framework/components/LoadingState';
import { PlatformOrganization } from '../../../interfaces/PlatformOrganization';
import { PlatformRoute } from '../../../main/PlatformRoutes';
import { useTeamColumns } from '../../teams/hooks/useTeamColumns';
import { useTeamFilters } from '../../teams/hooks/useTeamFilters';
import {
  useOrganizationTeamsRowActions,
  useOrganizationTeamsToolbarActions,
} from '../hooks/useOrganizationTeamsActions';

export function PlatformOrganizationTeams() {
  const { t } = useTranslation();
  const toolbarFilters = useTeamFilters();
  const tableColumns = useTeamColumns();
  const pageNavigate = usePageNavigate();
  const params = useParams<{ id: string }>();
  const {
    data: organization,
    isLoading,
    error,
  } = useGetItem<PlatformOrganization>(gatewayAPI`/organizations`, params.id);

  const view = usePlatformView<PlatformTeam>({
    url: gatewayAPI`/organizations/${organization?.id?.toString() ?? ''}/teams/`,
    toolbarFilters,
    tableColumns,
  });

  const { data: createTeamOptions, isLoading: isLoadingOptions } = useOptions<
    OptionsResponse<ActionsResponse>
  >(gatewayAPI`/teams/`);
  const canCreateTeam = Boolean(
    createTeamOptions && createTeamOptions.actions && createTeamOptions.actions['POST']
  );
  const toolbarActions = useOrganizationTeamsToolbarActions();
  const rowActions = useOrganizationTeamsRowActions();

  if (isLoading || isLoadingOptions) return <LoadingState />;
  if (error) return <AwxError error={error} />;

  return (
    <PageTable<PlatformTeam>
      id="platform-organization-teams-table"
      toolbarFilters={toolbarFilters}
      toolbarActions={toolbarActions}
      tableColumns={tableColumns.slice(0, 1)}
      rowActions={rowActions}
      errorStateTitle={t('Error loading teams')}
      emptyStateTitle={
        canCreateTeam
          ? t('There are currently no teams created in this organization.')
          : t('You do not have permission to create teams.')
      }
      emptyStateDescription={
        canCreateTeam
          ? t('Create a team by clicking the button below.')
          : t(
              'Please contact your organization administrator if there is an issue with your access.'
            )
      }
      emptyStateIcon={canCreateTeam ? undefined : CubesIcon}
      emptyStateButtonIcon={<PlusCircleIcon />}
      emptyStateButtonText={canCreateTeam ? t('Create team') : undefined}
      emptyStateButtonClick={
        canCreateTeam ? () => pageNavigate(PlatformRoute.CreateTeam) : undefined
      }
      {...view}
    />
  );
}
