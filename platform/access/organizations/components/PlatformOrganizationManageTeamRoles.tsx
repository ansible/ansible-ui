import {
  LoadingPage,
  PageForm,
  PageHeader,
  PageLayout,
  useGetPageUrl,
  usePageNavigate,
} from '@ansible/ansible-ui-framework';
import { PageMultiSelectList } from '@ansible/ansible-ui-framework/PageTable/PageMultiSelectList';
import { useAwxBulkActionDialog } from '@ansible/awx-ui/common/useAwxBulkActionDialog';
import { postRequest, requestDelete } from '@ansible/common-ui/crud/Data';
import { useGet } from '@ansible/common-ui/crud/useGet';
import { Content, ContentVariants } from '@patternfly/react-core';
import { useCallback, useEffect } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { usePlatformView } from '../../../hooks/usePlatformView';
import { PlatformOrganization } from '../../../interfaces/PlatformOrganization';
import { PlatformRbacRole } from '../../../interfaces/PlatformRbacRole';
import { PlatformTeam } from '../../../interfaces/PlatformTeam';
import { PlatformRoute } from '../../../main/PlatformRoutes';
import { gatewayAPI } from '../../../utils/gateway-api-utils';
import { usePlatformRoleColumns } from '../../roles/hooks/usePlatformRoleColumns';
import { usePlatformRolesFilters } from '../../roles/hooks/usePlatformRolesFilters';
import { useGetOrganizationRolesForTeam } from '../hooks/useGetOrganizationRolesForTeam';
import { getAddedAndRemovedPlatformRoles } from '../utils/getAddedAndRemovedPlatformRoles';

interface RemoveRole {
  remove?: boolean;
  roleAssignmentId?: number;
}

export interface WizardFormValues {
  teams: PlatformTeam[];
  platformRoles: (PlatformRbacRole & RemoveRole)[];
}

interface TeamAndPlatformRole {
  team: PlatformTeam;
  platformRole: PlatformRbacRole & RemoveRole;
}

const HelpText = styled(Content)`
  margin-block: var(--pf-t--global--spacer--lg) var(--pf-t--global--spacer--xl);
`;

export function PlatformOrganizationManageTeamRoles() {
  const { t } = useTranslation();
  const params = useParams<{ id: string; teamId: string }>();
  const getPageUrl = useGetPageUrl();
  const pageNavigate = usePageNavigate();
  const progressDialog = useAwxBulkActionDialog<TeamAndPlatformRole>();
  // Platform Organization
  const { data: organization, isLoading: isLoadingOrg } = useGet<PlatformOrganization>(
    gatewayAPI`/organizations/${params.id || ''}/`
  );
  // Platform Team
  const { data: team, isLoading: isLoadingTeam } = useGet<PlatformTeam>(
    gatewayAPI`/teams/${params.teamId || ''}/`
  );

  // Existing selection of roles for the team based on role team assignments
  const { selectedRoles: initialRoles, isLoading: isInitialRolesLoading } =
    useGetOrganizationRolesForTeam(organization, team);

  const defaultValue = {
    platformRoles: initialRoles ?? [],
  };

  const toolbarFilters = usePlatformRolesFilters();
  const tableColumns = usePlatformRoleColumns({ disableExtraColumns: true, disableLinks: true });

  const view = usePlatformView<PlatformRbacRole>({
    url: gatewayAPI`/role_definitions/`,
    queryParams: {
      content_type__api_slug: 'shared.organization',
      not__name__contains: ['Organization Member', 'Organization Admin'],
    },
    toolbarFilters,
    tableColumns,
    disableQueryString: true,
    defaultSelection: initialRoles,
  });

  // If the user saves then immediately re-enters the manage
  // roles form, the old assignments are sometimes still cached
  // in swr. This ensures the updated values show in the form
  // when that occurs.
  useEffect(() => {
    view.unselectAll();
    view.selectItems(initialRoles);
  }, [initialRoles]); // eslint-disable-line react-hooks/exhaustive-deps

  const progressDialogActionFunction = useCallback(
    (item: TeamAndPlatformRole, signal: AbortSignal): Promise<unknown> | undefined => {
      if (!item.platformRole) {
        return;
      }

      if (item.platformRole.remove) {
        return requestDelete(
          gatewayAPI`/role_team_assignments/` +
            `${item.platformRole.roleAssignmentId?.toString()}/`,
          signal
        );
      }
      return postRequest(
        gatewayAPI`/role_team_assignments/`,
        {
          team: team?.id,
          role_definition: item.platformRole.id,
          content_type: 'shared.organization',
          object_id: organization?.id || '',
        },
        signal
      );
    },
    [organization, team?.id]
  );

  if (isLoadingOrg || isLoadingTeam || isInitialRolesLoading || !organization || !team) {
    return <LoadingPage />;
  }

  const onSubmit = () => {
    const updatedRoles = view.selectedItems as (PlatformRbacRole & RemoveRole)[];
    const platformRolesData: (PlatformRbacRole & { remove?: boolean })[] = [];

    if (initialRoles?.length) {
      const platformRoles = getAddedAndRemovedPlatformRoles(
        initialRoles as (PlatformRbacRole & RemoveRole)[],
        updatedRoles
      );
      platformRolesData.push(...(platformRoles as (PlatformRbacRole & { remove?: boolean })[]));
    } else {
      platformRolesData.push(...updatedRoles);
    }

    const platformTeamRolePairs: TeamAndPlatformRole[] = [];
    if (platformRolesData) {
      for (const platformRole of platformRolesData) {
        platformTeamRolePairs.push({ team, platformRole });
      }
    }

    const items = platformTeamRolePairs;
    if (!items.length) {
      return new Promise<void>((resolve) => {
        resolve();
        pageNavigate(PlatformRoute.OrganizationTeams, {
          params: { id: organization.id.toString() },
        });
      });
    }

    return new Promise<void>((resolve) => {
      progressDialog({
        title: t('Manage roles'),
        description: (
          <Trans>
            The organization roles listed below for <b>{team.name}</b> have been changed.
          </Trans>
        ),
        keyFn: (item) => item.platformRole.id,
        items,
        actionColumns: [
          {
            header: t('Role'),
            cell: (item) => item.platformRole.name,
          },
          {
            header: t('Assignment type'),
            cell: (item) => {
              if (item.platformRole) {
                return item.platformRole.remove ? t('Removed') : t('Added');
              }
            },
          },
        ],
        actionFn: progressDialogActionFunction as (
          item: TeamAndPlatformRole,
          signal: AbortSignal
        ) => Promise<unknown>,
        onComplete: () => {
          resolve();
        },
        onClose: () => {
          pageNavigate(PlatformRoute.OrganizationTeams, {
            params: { id: organization.id.toString() },
          });
        },
      });
    });
  };

  return (
    <PageLayout>
      <PageHeader
        title={t('Manage roles for {{teamName}}', { teamName: team?.name })}
        breadcrumbs={[
          { label: t('Organizations'), to: getPageUrl(PlatformRoute.Organizations) },
          {
            label: organization?.name,
            to: getPageUrl(PlatformRoute.OrganizationDetails, { params: { id: organization?.id } }),
          },
          {
            label: t('Teams'),
            to: getPageUrl(PlatformRoute.OrganizationTeams, { params: { id: organization?.id } }),
          },
          { label: t('Manage {{teamName}} roles', { teamName: team?.name }) },
        ]}
      />
      <PageForm
        submitText={t`Save roles`}
        onSubmit={onSubmit}
        cancelText={t`Cancel`}
        onCancel={() =>
          pageNavigate(PlatformRoute.OrganizationTeams, {
            params: { id: organization.id, teamId: team.id },
          })
        }
        defaultValue={defaultValue}
        disableGrid
      >
        <HelpText component={ContentVariants.p}>
          {t(
            'Select organization roles that you want to directly assign to {{team}}. These roles will apply to the relevant resources within this organization.',
            {
              team: team.name,
            }
          )}
        </HelpText>
        <PageMultiSelectList
          view={view}
          tableColumns={tableColumns}
          toolbarFilters={toolbarFilters}
          labelForSelectedItems={t('Selected roles')}
          errorStateTitle={t('Error loading roles')}
        />
      </PageForm>
    </PageLayout>
  );
}
