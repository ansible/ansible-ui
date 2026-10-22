import { PageTable, useGetPageUrl } from '@ansible/ansible-ui-framework';
import { PageTableEmptyState } from '@ansible/ansible-ui-framework/PageTable/PageTableEmptyState';
import { ButtonLink } from '@ansible/ansible-ui-framework/components/ButtonLink';
import { LoadingState } from '@ansible/ansible-ui-framework/components/LoadingState';
import { AwxError } from '@ansible/awx-ui/common/AwxError';
import { ActionsResponse, OptionsResponse } from '@ansible/common-ui/interfaces/OptionsResponse';
import { useGetItem } from '@ansible/common-ui/crud/useGet';
import { useOptions } from '@ansible/common-ui/crud/useOptions';
import { Alert, ButtonVariant, PageSection } from '@patternfly/react-core';
import { CubesIcon, PanelCloseIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { PlatformOrganization } from '../../../interfaces/PlatformOrganization';
import { PlatformTeam } from '../../../interfaces/PlatformTeam';
import { PlatformRoute } from '../../../main/PlatformRoutes';
import { gatewayAPI } from '../../../utils/gateway-api-utils';
import { useOrganizationTeamColumns } from '../../teams/hooks/useOrganizationTeamColumns';
import { useTeamFilters } from '../../teams/hooks/useTeamFilters';
import {
  useOrganizationTeamsRowActions,
  useOrganizationTeamsToolbarActions,
} from '../hooks/useOrganizationTeamsActions';
import {
  TeamRoleEntry,
  useOrganizationTeamsWithRoles,
} from '../hooks/useOrganizationTeamsWithRoles';

export function PlatformOrganizationTeams() {
  const { t } = useTranslation();
  const toolbarFilters = useTeamFilters();
  const getPageUrl = useGetPageUrl();
  const params = useParams<{ id: string }>();
  const {
    data: organization,
    isLoading,
    error,
  } = useGetItem<PlatformOrganization>(gatewayAPI`/organizations`, params.id);

  const emptyRolesByTeamId = useMemo(() => new Map<number, TeamRoleEntry[]>(), []);
  const initialTableColumns = useOrganizationTeamColumns(emptyRolesByTeamId);
  const { view, rolesByTeamId, isLoadingRoleAssignments } = useOrganizationTeamsWithRoles(
    organization?.id,
    toolbarFilters,
    initialTableColumns
  );
  const tableColumns = useOrganizationTeamColumns(rolesByTeamId);

  const { data: createTeamOptions, isLoading: isLoadingOptions } = useOptions<
    OptionsResponse<ActionsResponse>
  >(gatewayAPI`/teams/`);
  const canCreateTeam = Boolean(
    createTeamOptions && createTeamOptions.actions && createTeamOptions.actions['POST']
  );
  const toolbarActions = useOrganizationTeamsToolbarActions();
  const rowActions = useOrganizationTeamsRowActions();

  if (isLoading || isLoadingOptions || isLoadingRoleAssignments) return <LoadingState />;
  if (error) return <AwxError error={error} />;

  return (
    <>
      <PageSection>
        <Alert
          isInline
          variant="info"
          title={t(
            'Below displays teams in this organization, including teams from other organizations with assigned roles in this organization.'
          )}
        />
      </PageSection>
      <PageTable<PlatformTeam>
        id="platform-organization-teams-table"
        toolbarFilters={toolbarFilters}
        toolbarActions={toolbarActions}
        tableColumns={tableColumns}
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
    </>
  );
}
