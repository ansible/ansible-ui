import { CubesIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { PageActions, PageHeader, PageLayout, PageTable } from '../../../../framework';
import { useRefreshAction } from '../../../common/useRefreshAction';
import { useOptions } from '../../../Data';
import { RouteObj } from '../../../Routes';
import { ActionsResponse, OptionsResponse } from '../../interfaces/OptionsResponse';
import { Team } from '../../interfaces/Team';
import { useAwxView } from '../../useAwxView';
import { AccessNav } from '../common/AccessNav';
import { useTeamActions } from './hooks/useTeamActions';
import { useTeamsColumns } from './hooks/useTeamsColumns';
import { useTeamsFilters } from './hooks/useTeamsFilters';
import { useTeamToolbarActions } from './hooks/useTeamToolbarActions';

export function Teams() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const toolbarFilters = useTeamsFilters();
  const tableColumns = useTeamsColumns();
  const view = useAwxView<Team>({ url: '/api/v2/teams/', toolbarFilters, tableColumns });
  const toolbarActions = useTeamToolbarActions(view);
  const rowActions = useTeamActions({ onTeamsDeleted: view.unselectItemsAndRefresh });
  const headerActions = useRefreshAction(view.refreshing, view.refresh);
  const { data } = useOptions<OptionsResponse<ActionsResponse>>({ url: '/api/v2/teams/' });
  const canCreateTeam = Boolean(data && data.actions && data.actions['POST']);

  return (
    <PageLayout>
      <PageHeader
        title={t('Teams')}
        titleHelpTitle={t('Team')}
        titleHelp={[
          t(
            'A Team is a subdivision of an organization with associated users, projects, credentials, and permissions.'
          ),
          t(
            'Teams provide a means to implement role-based access control schemes and delegate responsibilities across organizations.'
          ),
          t(
            'For instance, permissions may be granted to a whole Team rather than each user on the Team.'
          ),
        ]}
        titleDocLink="https://docs.ansible.com/ansible-tower/latest/html/userguide/teams.html"
        description={t(
          'A Team is a subdivision of an organization with associated users, projects, credentials, and permissions.'
        )}
        navigation={<AccessNav active="teams" />}
        headerActions={<PageActions actions={headerActions} iconOnly collapse="never" />}
      />
      <PageTable<Team>
        toolbarFilters={toolbarFilters}
        toolbarActions={toolbarActions}
        tableColumns={tableColumns}
        rowActions={rowActions}
        errorStateTitle={t('Error loading teams')}
        emptyStateTitle={
          canCreateTeam
            ? t('There are currently no teams added to your organization.')
            : t('You do not have permission to create a team')
        }
        emptyStateDescription={
          canCreateTeam
            ? t('Please create a team by using the button below.')
            : t(
                'Please contact your Organization Administrator if there is an issue with your access.'
              )
        }
        emptyStateIcon={canCreateTeam ? undefined : CubesIcon}
        emptyStateButtonText={canCreateTeam ? t('Create team') : undefined}
        emptyStateButtonClick={canCreateTeam ? () => navigate(RouteObj.CreateTeam) : undefined}
        {...view}
        defaultSubtitle={t('Team')}
        expandedRow={(team: Team) => (team.description ? <>{team.description}</> : undefined)}
      />
    </PageLayout>
  );
}
