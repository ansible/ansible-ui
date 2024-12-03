import { PageHeader, PageLayout, PageTable, useGetPageUrl } from '@ansible/ansible-ui-framework';
import { PageTableEmptyState } from '@ansible/ansible-ui-framework/PageTable/PageTableEmptyState';
import { ButtonLink } from '@ansible/ansible-ui-framework/components/ButtonLink';
import { usePersistentFilters } from '@ansible/common-ui/PersistentFilters';
import { useOptions } from '@ansible/common-ui/crud/useOptions';
import { ButtonVariant } from '@patternfly/react-core';
import { CubesIcon, PlusCircleIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import { ActivityStreamIcon } from '../../common/ActivityStreamIcon';
import { awxAPI } from '../../common/api/awx-utils';
import { useAwxConfig } from '../../common/useAwxConfig';
import { useAwxView } from '../../common/useAwxView';
import { useGetDocsUrl } from '@ansible/common-ui/utils/useGetDocsUrl';
import { ActionsResponse, OptionsResponse } from '../../interfaces/OptionsResponse';
import { Team } from '../../interfaces/Team';
import { AwxRoute } from '../../main/AwxRoutes';
import { useTeamActions } from './hooks/useTeamActions';
import { useTeamToolbarActions } from './hooks/useTeamToolbarActions';
import { useTeamsColumns } from './hooks/useTeamsColumns';
import { useTeamsFilters } from './hooks/useTeamsFilters';

export function Teams() {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
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
        titleHelpTitle={t('Teams')}
        titleHelp={[
          t(
            'A team is a subdivision of an organization with associated users, projects, credentials, and permissions.'
          ),
          t(
            'Teams provide a means to implement role-based access control schemes and delegate responsibilities across organizations.'
          ),
          t(
            'For instance, permissions may be granted to a whole team rather than each user on the team.'
          ),
        ]}
        titleDocLink={useGetDocsUrl(config, 'teams')}
        description={t(
          'A team is a subdivision of an organization with associated users, projects, credentials, and permissions.'
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
        emptyState={
          canCreateTeam ? (
            <PageTableEmptyState
              title={t('No teams found')}
              description={t('There are currently no teams added to your organization.')}
            >
              <ButtonLink
                icon={<PlusCircleIcon />}
                variant={ButtonVariant.primary}
                href={getPageUrl(AwxRoute.CreateTeam)}
              >
                {t('Create team')}
              </ButtonLink>
            </PageTableEmptyState>
          ) : (
            <PageTableEmptyState
              icon={CubesIcon}
              title={t('No teams found')}
              description={t(
                'Please contact your organization administrator if there is an issue with your access.'
              )}
            />
          )
        }
        defaultSubtitle={t('Team')}
        {...view}
      />
    </PageLayout>
  );
}
