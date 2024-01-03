import { CubesIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import { PageHeader, PageLayout, PageTable, usePageNavigate } from '../../../../framework';
import {
  ActionsResponse,
  OptionsResponse,
} from '../../../../frontend/awx/interfaces/OptionsResponse';
import { useOptions } from '../../../../frontend/common/crud/useOptions';
import { PlatformRoute } from '../../../PlatformRoutes';
import { gatewayAPI } from '../../../api/gateway-api-utils';
import { usePlatformView } from '../../../hooks/usePlatformView';
import { PlatformTeam } from '../../../interfaces/PlatformTeam';
import { useTeamRowActions, useTeamToolbarActions } from '../hooks/useTeamActions';
import { useTeamColumns } from '../hooks/useTeamColumns';
import { useTeamFilters } from '../hooks/useTeamFilters';

export function PlatformTeamList() {
  const { t } = useTranslation();
  const toolbarFilters = useTeamFilters();
  const tableColumns = useTeamColumns();
  const pageNavigate = usePageNavigate();

  const view = usePlatformView<PlatformTeam>({
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
      <PageHeader
        title={t('Teams')}
        description={t('A team is a group of users that can be assigned permissions to resources.')}
        titleHelpTitle={t('Team')}
        titleHelp={[
          t('A team is a group of users that can be assigned permissions to resources.'),
          t(
            'Teams provide a means to implement role-based access control schemes and delegate responsibilities across organizations. For instance, permissions may be granted to a whole team rather than each user on the team.'
          ),
        ]}
        titleDocLink="https://docs.ansible.com"
      />
      <PageTable<PlatformTeam>
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
        defaultSubtitle={t('Team')}
      />
    </PageLayout>
  );
}
