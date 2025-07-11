import { PageTable, useGetPageUrl } from '@ansible/ansible-ui-framework';
import { AwxError } from '@ansible/awx-ui/common/AwxError';
import { ActionsResponse, OptionsResponse } from '@ansible/awx-ui/interfaces/OptionsResponse';
import { useGetItem } from '@ansible/common-ui/crud/useGet';
import { useOptions } from '@ansible/common-ui/crud/useOptions';
import { CubesIcon, PanelCloseIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
import { usePlatformView } from '../../../hooks/usePlatformView';
import { PlatformTeam } from '../../../interfaces/PlatformTeam';
import { gatewayAPI } from '../../../utils/gateway-api-utils';

import { PageTableEmptyState } from '@ansible/ansible-ui-framework/PageTable/PageTableEmptyState';
import { ButtonLink } from '@ansible/ansible-ui-framework/components/ButtonLink';
import { LoadingState } from '@ansible/ansible-ui-framework/components/LoadingState';
import { ButtonVariant } from '@patternfly/react-core';
import { PlatformOrganization } from '../../../interfaces/PlatformOrganization';
import { PlatformRoute } from '../../../main/PlatformRoutes';
import { useTeamColumns } from '../../teams/hooks/useTeamColumns';
import { useTeamFilters } from '../../teams/hooks/useTeamFilters';
import {
  useOrganizationTeamsRowActions,
  useOrganizationTeamsToolbarActions,
} from '../hooks/useOrganizationTeamsActions';

export function PlatformOrganizationTeams() {
  const { t } = useTranslation();
  const toolbarFilters = useTeamFilters();
  const tableColumns = useTeamColumns();
  const getPageUrl = useGetPageUrl();
  const params = useParams<{ id: string }>();
  const {
    data: organization,
    isLoading,
    error,
  } = useGetItem<PlatformOrganization>(gatewayAPI`/organizations`, params.id);

  const view = usePlatformView<PlatformTeam>({
    url: gatewayAPI`/organizations/${organization?.id?.toString() ?? ''}/teams/`,
    toolbarFilters,
    tableColumns,
  });

  const { data: createTeamOptions, isLoading: isLoadingOptions } = useOptions<
    OptionsResponse<ActionsResponse>
  >(gatewayAPI`/teams/`);
  const canCreateTeam = Boolean(
    createTeamOptions && createTeamOptions.actions && createTeamOptions.actions['POST']
  );
  const toolbarActions = useOrganizationTeamsToolbarActions();
  const rowActions = useOrganizationTeamsRowActions();

  if (isLoading || isLoadingOptions) return <LoadingState />;
  if (error) return <AwxError error={error} />;

  return (
    <PageTable<PlatformTeam>
      id="platform-organization-teams-table"
      toolbarFilters={toolbarFilters}
      toolbarActions={toolbarActions}
      tableColumns={tableColumns.slice(0, 1)}
      rowActions={rowActions}
      errorStateTitle={t('Error loading teams')}
      emptyState={
        canCreateTeam ? (
          <PageTableEmptyState
            title={t('No teams')}
            description={t(
              'No teams have been created or assigned to this organization. Go to the Teams section to create a team, then you can assign that team to this organization. Once teams are assigned to this organization, they can be assigned roles for the resources within this organization.'
            )}
          >
            <ButtonLink
              icon={<PanelCloseIcon />}
              variant={ButtonVariant.link}
              href={getPageUrl(PlatformRoute.CreateTeam)}
            >
              {t('Go to Teams section and create team')}
            </ButtonLink>
          </PageTableEmptyState>
        ) : (
          <PageTableEmptyState
            icon={CubesIcon}
            title={t('You do not have permission to create teams.')}
            description={t(
              'Please contact your organization administrator if there is an issue with your access.'
            )}
          />
        )
      }
      {...view}
    />
  );
}
