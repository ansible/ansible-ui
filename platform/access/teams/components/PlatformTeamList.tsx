import { ButtonVariant } from '@patternfly/react-core';
import { CubesIcon, PlusCircleIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import {
  LoadingPage,
  PageHeader,
  PageLayout,
  PageTable,
  useGetPageUrl,
} from '../../../../framework';
import { PageTableEmptyState } from '../../../../framework/PageTable/PageTableEmptyState';
import { ButtonLink } from '../../../../framework/components/ButtonLink';
import { AwxError } from '../../../../frontend/awx/common/AwxError';
import {
  ActionsResponse,
  OptionsResponse,
} from '../../../../frontend/awx/interfaces/OptionsResponse';
import { usePersistentFilters } from '../../../../frontend/common/PersistentFilters';
import { useOptions } from '../../../../frontend/common/crud/useOptions';
import { usePlatformView } from '../../../hooks/usePlatformView';
import { PlatformTeam } from '../../../interfaces/PlatformTeam';
import { PlatformRoute } from '../../../main/PlatformRoutes';
import { gatewayAPI } from '../../../utils/gateway-api-utils';
import { useTeamRowActions, useTeamToolbarActions } from '../hooks/useTeamActions';
import { useTeamColumns } from '../hooks/useTeamColumns';
import { useTeamFilters } from '../hooks/useTeamFilters';
import { useGetDocsUrl } from '../../../../frontend/awx/common/util/useGetDocsUrl';

export function PlatformTeamList() {
  const { t } = useTranslation();
  const toolbarFilters = useTeamFilters();
  const tableColumns = useTeamColumns();
  const getPageUrl = useGetPageUrl();
  usePersistentFilters('teams');

  const view = usePlatformView<PlatformTeam>({
    url: gatewayAPI`/teams/`,
    toolbarFilters,
    tableColumns,
  });

  const {
    data,
    isLoading: isLoadingOptions,
    error,
  } = useOptions<OptionsResponse<ActionsResponse>>(gatewayAPI`/teams/`);
  const canCreateTeam = Boolean(data && data.actions && data.actions['POST']);
  const toolbarActions = useTeamToolbarActions(view);
  const rowActions = useTeamRowActions(view.unselectItemsAndRefresh);
  const docsLink = useGetDocsUrl(undefined, 'teams');

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
        titleDocLink={docsLink}
      />
      <PageTable<PlatformTeam>
        id="platform-teams-table"
        toolbarFilters={toolbarFilters}
        toolbarActions={toolbarActions}
        tableColumns={tableColumns}
        rowActions={rowActions}
        errorStateTitle={t('Error loading teams')}
        defaultSubtitle={t('Team')}
        emptyState={
          canCreateTeam ? (
            <PageTableEmptyState
              title={t('No teams found.')}
              description={t('There are currently no teams added to your organization.')}
            >
              <ButtonLink
                icon={<PlusCircleIcon />}
                variant={ButtonVariant.primary}
                href={getPageUrl(PlatformRoute.CreateTeam)}
              >
                {t('Create team')}
              </ButtonLink>
            </PageTableEmptyState>
          ) : (
            <PageTableEmptyState
              icon={CubesIcon}
              title={t('You do not have permission to create a team')}
              description={t(
                'Please contact your organization administrator if there is an issue with your access.'
              )}
            />
          )
        }
        {...view}
      />
    </PageLayout>
  );
}
