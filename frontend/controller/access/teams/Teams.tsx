import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { PageActions, PageHeader, PageLayout, PageTable } from '../../../../framework';
import { useRefreshAction } from '../../../common/useRefreshAction';
import { RouteE } from '../../../Routes';
import { Team } from '../../interfaces/Team';
import { useControllerView } from '../../useControllerView';
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
  const view = useControllerView<Team>({ url: '/api/v2/teams/', toolbarFilters, tableColumns });
  const toolbarActions = useTeamToolbarActions(view);
  const rowActions = useTeamActions({ onTeamsDeleted: view.unselectItemsAndRefresh });
  const headerActions = useRefreshAction(view.refreshing, view.refresh);
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
        emptyStateTitle={t('No teams yet')}
        emptyStateDescription={t('To get started, create a team.')}
        emptyStateButtonText={t('Create team')}
        emptyStateButtonClick={() => navigate(RouteE.CreateTeam)}
        {...view}
        defaultSubtitle={t('Team')}
        expandedRow={(team: Team) => (team.description ? <>{team.description}</> : undefined)}
      />
    </PageLayout>
  );
}
