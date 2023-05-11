import { CubesIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { PageHeader, PageLayout, PageTable } from '../../../../framework';
import { RouteObj } from '../../../Routes';
import { useOptions } from '../../../common/crud/useOptions';
import { usePersistentFilters } from '../../../common/PersistentFilters';
import { ActionsResponse, OptionsResponse } from '../../interfaces/OptionsResponse';
import { Team } from '../../interfaces/Team';
import { useAwxView } from '../../useAwxView';
import { AccessNav } from '../common/AccessNav';
import { useTeamActions } from './hooks/useTeamActions';
import { useTeamToolbarActions } from './hooks/useTeamToolbarActions';
import { useTeamsColumns } from './hooks/useTeamsColumns';
import { useTeamsFilters } from './hooks/useTeamsFilters';
import getDocsBaseUrl from '../../common/util/getDocsBaseUrl';
import { useAwxConfig } from '../../common/useAwxConfig';

export function Teams() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const toolbarFilters = useTeamsFilters();
  const tableColumns = useTeamsColumns();
  const view = useAwxView<Team>({ url: '/api/v2/teams/', toolbarFilters, tableColumns });
  const toolbarActions = useTeamToolbarActions(view);
  const rowActions = useTeamActions({ onTeamsDeleted: view.unselectItemsAndRefresh });
  const { data } = useOptions<OptionsResponse<ActionsResponse>>('/api/v2/teams/');
  const canCreateTeam = Boolean(data && data.actions && data.actions['POST']);
  usePersistentFilters('teams');
  const config = useAwxConfig();

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
        titleDocLink={`${getDocsBaseUrl(config)}/html/userguide/teams.html`}
        description={t(
          'A Team is a subdivision of an organization with associated users, projects, credentials, and permissions.'
        )}
        navigation={<AccessNav active="teams" />}
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
                'Please contact your organization administrator if there is an issue with your access.'
              )
        }
        emptyStateIcon={canCreateTeam ? undefined : CubesIcon}
        emptyStateButtonText={canCreateTeam ? t('Create team') : undefined}
        emptyStateButtonClick={canCreateTeam ? () => navigate(RouteObj.CreateTeam) : undefined}
        {...view}
        defaultSubtitle={t('Team')}
      />
    </PageLayout>
  );
}
