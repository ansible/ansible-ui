import { CubesIcon, PlusCircleIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import { PageHeader, PageLayout, PageTable, usePageNavigate } from '../../../../framework';
import { usePersistentFilters } from '../../../common/PersistentFilters';
import { useOptions } from '../../../common/crud/useOptions';
import { awxAPI } from '../../common/api/awx-utils';
import { useAwxConfig } from '../../common/useAwxConfig';
import { useAwxView } from '../../common/useAwxView';
import { useGetDocsUrl } from '../../common/util/useGetDocsUrl';
import { ActionsResponse, OptionsResponse } from '../../interfaces/OptionsResponse';
import { Team } from '../../interfaces/Team';
import { AwxRoute } from '../../main/AwxRoutes';
import { useTeamActions } from './hooks/useTeamActions';
import { useTeamToolbarActions } from './hooks/useTeamToolbarActions';
import { useTeamsColumns } from './hooks/useTeamsColumns';
import { useTeamsFilters } from './hooks/useTeamsFilters';
import { ActivityStreamIcon } from '../../common/ActivityStreamIcon';

export function Teams() {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const toolbarFilters = useTeamsFilters();
  const tableColumns = useTeamsColumns();
  const view = useAwxView<Team>({ url: awxAPI`/teams/`, toolbarFilters, tableColumns });
  const toolbarActions = useTeamToolbarActions(view);
  const rowActions = useTeamActions({ onTeamsDeleted: view.unselectItemsAndRefresh });
  const { data } = useOptions<OptionsResponse<ActionsResponse>>(awxAPI`/teams/`);
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
        titleDocLink={useGetDocsUrl(config, 'teams')}
        description={t(
          'A Team is a subdivision of an organization with associated users, projects, credentials, and permissions.'
        )}
        headerActions={<ActivityStreamIcon type={'team'} />}
      />
      <PageTable<Team>
        id="awx-teams-table"
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
        emptyStateButtonIcon={<PlusCircleIcon />}
        emptyStateButtonText={canCreateTeam ? t('Create team') : undefined}
        emptyStateButtonClick={canCreateTeam ? () => pageNavigate(AwxRoute.CreateTeam) : undefined}
        {...view}
        defaultSubtitle={t('Team')}
      />
    </PageLayout>
  );
}
