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
  const rowActions = useTeamActions(view);
  const headerActions = useRefreshAction(view.refreshing, view.refresh);
  return (
    <PageLayout>
      <PageHeader
        title={t('Teams')}
        titleHelpTitle={t('Team')}
        titleHelp={t('teams.title.help')}
        titleDocLink="https://docs.ansible.com/ansible-tower/latest/html/userguide/teams.html"
        description={t('teams.title.description')}
        navigation={<AccessNav active="teams" />}
        headerActions={<PageActions actions={headerActions} iconOnly collapse="never" />}
      />
      <PageTable
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
      />
    </PageLayout>
  );
}
