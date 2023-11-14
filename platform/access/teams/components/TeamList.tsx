import { useTranslation } from 'react-i18next';
import { PageHeader, PageLayout, PageTable, usePageNavigate } from '../../../../framework';
import { useTeamFilters } from '../hooks/useTeamFilters';
import { useTeamColumns } from '../hooks/useTeamColumns';
import { Team } from '../../../interfaces/Team';
import { usePlatformView } from '../../../hooks/usePlatformView';
import { CubesIcon } from '@patternfly/react-icons';
import { PlatformRoute } from '../../../PlatformRoutes';
import { useTeamRowActions, useTeamToolbarActions } from '../hooks/useTeamActions';
import {
  ActionsResponse,
  OptionsResponse,
} from '../../../../frontend/awx/interfaces/OptionsResponse';
import { useOptions } from '../../../../frontend/common/crud/useOptions';
import { gatewayAPI } from '../../../api/gateway-api-utils';

export function TeamList() {
  const { t } = useTranslation();
  const toolbarFilters = useTeamFilters();
  const tableColumns = useTeamColumns();
  const pageNavigate = usePageNavigate();

  const view = usePlatformView<Team>({
    url: gatewayAPI`/v1/teams`,
    toolbarFilters,
    tableColumns,
  });

  const { data } = useOptions<OptionsResponse<ActionsResponse>>(gatewayAPI`/v1/teams`);
  const canCreateTeam = Boolean(data && data.actions && data.actions['POST']);
  const toolbarActions = useTeamToolbarActions(view);
  const rowActions = useTeamRowActions(view);

  return (
    <PageLayout>
      <PageHeader title={t('Teams')} />
      <PageTable<Team>
        id="platform-teams-table"
        toolbarFilters={toolbarFilters}
        toolbarActions={toolbarActions}
        tableColumns={tableColumns}
        rowActions={rowActions}
        errorStateTitle={t('Error loading teams')}
        emptyStateTitle={
          canCreateTeam
            ? t('There are currently no teams added.')
            : t('You do not have permission to create a team')
        }
        emptyStateDescription={
          canCreateTeam
            ? t('Please create a team by using the button below.')
            : t(
                'Please contact your organization administrator if there is an issue with your access.'
              )
        }
        emptyStateIcon={canCreateTeam ? undefined : CubesIcon}
        emptyStateButtonText={canCreateTeam ? t('Create team') : undefined}
        emptyStateButtonClick={
          canCreateTeam ? () => pageNavigate(PlatformRoute.CreateTeam) : undefined
        }
        {...view}
      />
    </PageLayout>
  );
}
