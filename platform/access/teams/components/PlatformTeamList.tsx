import { CubesIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import {
  LoadingPage,
  PageHeader,
  PageLayout,
  PageTable,
  usePageNavigate,
} from '../../../../framework';
import {
  ActionsResponse,
  OptionsResponse,
} from '../../../../frontend/awx/interfaces/OptionsResponse';
import { usePersistentFilters } from '../../../../frontend/common/PersistentFilters';
import { useOptions } from '../../../../frontend/common/crud/useOptions';
import { gatewayV1API } from '../../../api/gateway-api-utils';
import { usePlatformView } from '../../../hooks/usePlatformView';
import { PlatformTeam } from '../../../interfaces/PlatformTeam';
import { PlatformRoute } from '../../../main/PlatformRoutes';
import { useTeamRowActions, useTeamToolbarActions } from '../hooks/useTeamActions';
import { useTeamColumns } from '../hooks/useTeamColumns';
import { useTeamFilters } from '../hooks/useTeamFilters';
import { AwxError } from '../../../../frontend/awx/common/AwxError';

export function PlatformTeamList() {
  const { t } = useTranslation();
  const toolbarFilters = useTeamFilters();
  const tableColumns = useTeamColumns();
  const pageNavigate = usePageNavigate();
  usePersistentFilters('teams');

  const view = usePlatformView<PlatformTeam>({
    url: gatewayV1API`/teams/`,
    toolbarFilters,
    tableColumns,
  });

  const {
    data,
    isLoading: isLoadingOptions,
    error,
  } = useOptions<OptionsResponse<ActionsResponse>>(gatewayV1API`/teams/`);
  const canCreateTeam = Boolean(data && data.actions && data.actions['POST']);
  const toolbarActions = useTeamToolbarActions(view);
  const rowActions = useTeamRowActions(view.unselectItemsAndRefresh);

  if (isLoadingOptions) return <LoadingPage />;
  if (error) return <AwxError error={error} />;

  return (
    <PageLayout>
      <PageHeader
        title={t('Teams')}
        description={t('A team is a group of users that can be assigned permissions to resources.')}
        titleHelpTitle={t('Teams')}
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
