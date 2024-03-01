import { useTranslation } from 'react-i18next';
import { PageTable, usePageNavigate } from '../../../../framework';
import { usePlatformView } from '../../../hooks/usePlatformView';
import { PlatformTeam } from '../../../interfaces/PlatformTeam';
import { gatewayV1API } from '../../../api/gateway-api-utils';
import { useParams } from 'react-router-dom';
import { useGetItem } from '../../../../frontend/common/crud/useGet';
import { AwxError } from '../../../../frontend/awx/common/AwxError';
import {
  ActionsResponse,
  OptionsResponse,
} from '../../../../frontend/awx/interfaces/OptionsResponse';
import { useOptions } from '../../../../frontend/common/crud/useOptions';
import { CubesIcon } from '@patternfly/react-icons';

import { PlatformOrganization } from '../../../interfaces/PlatformOrganization';
import {
  useOrganizationTeamsRowActions,
  useOrganizationTeamsToolbarActions,
} from '../hooks/useOrganizationTeamsActions';
import { useTeamFilters } from '../../teams/hooks/useTeamFilters';
import { useTeamColumns } from '../../teams/hooks/useTeamColumns';
import { PlatformRoute } from '../../../main/PlatformRoutes';
import { LoadingState } from '../../../../framework/components/LoadingState';

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
  } = useGetItem<PlatformOrganization>(gatewayV1API`/organizations`, params.id);

  const view = usePlatformView<PlatformTeam>({
    url: gatewayV1API`/organizations/${organization?.id?.toString() ?? ''}/teams/`,
    toolbarFilters,
    tableColumns,
  });

  const { data: createTeamOptions, isLoading: isLoadingOptions } = useOptions<
    OptionsResponse<ActionsResponse>
  >(gatewayV1API`/organizations/teams/`);
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
      emptyStateButtonText={canCreateTeam ? t('Create team') : undefined}
      emptyStateButtonClick={() => pageNavigate(PlatformRoute.CreateTeam)}
      {...view}
    />
  );
}
