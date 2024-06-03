import { Trans, useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import {
  LoadingPage,
  PageHeader,
  PageLayout,
  PageWizard,
  PageWizardStep,
  useGetPageUrl,
  usePageNavigate,
} from '../../../../framework';
import { useAwxBulkActionDialog } from '../../../../frontend/awx/common/useAwxBulkActionDialog';
import { gatewayV1API } from '../../../api/gateway-api-utils';
import { useGet } from '../../../../frontend/common/crud/useGet';
import { PlatformOrganization } from '../../../interfaces/PlatformOrganization';
import { AwxSelectRolesStep } from '../../../../frontend/awx/access/common/AwxRolesWizardSteps/AwxSelectRolesStep';
import { AwxRbacRole } from '../../../../frontend/awx/interfaces/AwxRbacRole';
import { EdaSelectRolesStep } from '../../../../frontend/eda/access/common/EdaRolesWizardSteps/EdaSelectRolesStep';
import { EdaRbacRole } from '../../../../frontend/eda/interfaces/EdaRbacRole';
import { RoleAssignmentsReviewStep } from '../../../../frontend/common/access/RolesWizard/steps/RoleAssignmentsReviewStep';
import { postRequest, requestDelete } from '../../../../frontend/common/crud/Data';
import { awxAPI } from '../../../../frontend/awx/common/api/awx-utils';
import { edaAPI } from '../../../../frontend/eda/common/eda-utils';
import { PlatformRoute } from '../../../main/PlatformRoutes';
import { useGatewayService } from '../../../main/GatewayServices';
import { useCallback, useMemo } from 'react';
import { getAddedAndRemovedRoles } from '../utils/getAddedAndRemovedRoles';
import { PlatformTeam } from '../../../interfaces/PlatformTeam';
import { useGetAwxOrganizationRolesForTeam } from '../hooks/useGetAwxOrganizationRolesForTeam';
import { useGetEdaOrganizationRolesForTeam } from '../hooks/useGetEdaOrganizationRolesForTeam';

interface RemoveRole {
  remove?: boolean;
  roleAssignmentId?: number;
}

interface WizardFormValues {
  teams: PlatformTeam[];
  awxRoles: (AwxRbacRole & RemoveRole)[];
  edaRoles: (EdaRbacRole & RemoveRole)[];
}

interface TeamAndAwxRole {
  team: PlatformTeam;
  awxRole: AwxRbacRole & RemoveRole;
}

interface TeamAndEdaRole {
  team: PlatformTeam;
  edaRole: EdaRbacRole & RemoveRole;
}

type TeamAndRolePair = TeamAndAwxRole | TeamAndEdaRole;

export function PlatformOrganizationManageTeamRoles() {
  const { t } = useTranslation();
  const params = useParams<{ id: string; teamId: string }>();
  const getPageUrl = useGetPageUrl();
  const pageNavigate = usePageNavigate();
  const progressDialog = useAwxBulkActionDialog<TeamAndRolePair>();
  // Platform Organization
  const { data: organization, isLoading: isLoadingOrg } = useGet<PlatformOrganization>(
    gatewayV1API`/organizations/${params.id || ''}/`
  );
  // Platform Team
  const { data: team, isLoading: isLoadingTeam } = useGet<PlatformTeam>(
    gatewayV1API`/teams/${params.teamId || ''}/`
  );

  // Existing selection of roles for the team based on role team assignments
  const { selectedRoles: selectedAwxRoles, isLoading: isLoadingSelectedAwxRoles } =
    useGetAwxOrganizationRolesForTeam(organization, team);
  const { selectedRoles: selectedEdaRoles, isLoading: isLoadingSelectedEdaRoles } =
    useGetEdaOrganizationRolesForTeam(organization, team);

  // Set default selections in the wizard
  const defaultValue = useMemo(
    () => ({
      awxRoles: selectedAwxRoles ? selectedAwxRoles : [],
      edaRoles: selectedEdaRoles ? selectedEdaRoles : [],
    }),
    [selectedAwxRoles, selectedEdaRoles]
  );

  const awxService = useGatewayService('controller');
  const edaService = useGatewayService('eda');

  const steps = useMemo<PageWizardStep[]>(
    () => [
      // Show a Roles step with substeps for Controller and EDA roles if both Controller and EDA services are enabled
      ...(awxService && edaService
        ? ([
            {
              id: 'roles',
              label: t('Select roles'),
              substeps: [
                {
                  id: 'awxRoles',
                  label: t('Automation Execution'),
                  inputs: (
                    <AwxSelectRolesStep
                      contentType="organization"
                      descriptionForRoleSelection={t(
                        'Select the roles that you want to apply to {{teamName}}.',
                        { teamName: team?.name }
                      )}
                      title={t('Select Automation Execution roles')}
                    />
                  ),
                },
                {
                  id: 'edaRoles',
                  label: t('Automation Decisions'),
                  inputs: (
                    <EdaSelectRolesStep
                      contentType="organization"
                      descriptionForRoleSelection={t(
                        'Select the roles that you want to apply to {{teamName}}.',
                        { teamName: team?.name }
                      )}
                      title={t('Select Automation Decisions roles')}
                    />
                  ),
                },
              ],
            },
          ] as PageWizardStep[])
        : []),
      ...(awxService && !edaService
        ? ([
            {
              id: 'roles',
              label: t('Select Automation Execution roles'),
              inputs: (
                <AwxSelectRolesStep
                  contentType="organization"
                  descriptionForRoleSelection={t(
                    'Select the roles that you want to apply to {{teamName}}.',
                    { teamName: team?.name }
                  )}
                  title={t('Select Automation Execution roles')}
                />
              ),
            },
          ] as PageWizardStep[])
        : []),
      ...(!awxService && edaService
        ? ([
            {
              id: 'roles',
              label: t('Select Automation Decisions roles'),
              inputs: (
                <EdaSelectRolesStep
                  contentType="organization"
                  descriptionForRoleSelection={t(
                    'Select the roles that you want to apply to {{teamName}}.',
                    { teamName: team?.name }
                  )}
                  title={t('Select Automation Decisions roles')}
                />
              ),
            },
          ] as PageWizardStep[])
        : []),
      {
        id: 'review',
        label: t('Review'),
        element: (
          <RoleAssignmentsReviewStep
            edaRolesLabel={t('Automation Decisions roles')}
            awxRolesLabel={t('Automation Execution roles')}
            selectedTeam={team}
          />
        ),
      },
    ],
    [awxService, edaService, t, team]
  );

  const progressDialogActionFunction = useCallback(
    (item: TeamAndRolePair, signal: AbortSignal) => {
      if ((item as TeamAndAwxRole).awxRole) {
        if ((item as TeamAndAwxRole).awxRole.remove) {
          return requestDelete(
            awxAPI`/role_team_assignments/` +
              `${(item as TeamAndAwxRole).awxRole.roleAssignmentId?.toString()}/`,
            signal
          );
        } else {
          return postRequest(
            awxAPI`/role_team_assignments/`,
            {
              team_ansible_id: item.team.summary_fields.resource.ansible_id,
              role_definition: (item as TeamAndAwxRole).awxRole.id,
              content_type: 'shared.organization',
              object_ansible_id: organization?.summary_fields?.resource?.ansible_id || '',
            },
            signal
          );
        }
      } else {
        if ((item as TeamAndEdaRole).edaRole.remove) {
          return requestDelete(
            edaAPI`/role_team_assignments/` +
              `${(item as TeamAndEdaRole).edaRole.roleAssignmentId?.toString()}/`,
            signal
          );
        } else {
          return postRequest(
            edaAPI`/role_team_assignments/`,
            {
              team_ansible_id: item.team.summary_fields.resource.ansible_id,
              role_definition: (item as TeamAndEdaRole).edaRole.id,
              content_type: 'shared.organization',
              object_ansible_id: organization?.summary_fields?.resource?.ansible_id || '',
            },
            signal
          );
        }
      }
    },
    [organization?.summary_fields?.resource?.ansible_id]
  );

  if (
    isLoadingOrg ||
    isLoadingTeam ||
    !organization ||
    !team ||
    isLoadingSelectedAwxRoles ||
    isLoadingSelectedEdaRoles
  ) {
    return <LoadingPage />;
  }

  const onSubmit = (data: WizardFormValues) => {
    const { awxRoles: updatedAwxRoles, edaRoles: updatedEdaRoles } = data;
    const awxRolesData: (AwxRbacRole & { remove?: boolean })[] = [];
    const edaRolesData: (EdaRbacRole & { remove?: boolean })[] = [];

    if (selectedAwxRoles?.length || selectedEdaRoles?.length) {
      const awxRoles = getAddedAndRemovedRoles(
        selectedAwxRoles as (AwxRbacRole & RemoveRole)[],
        updatedAwxRoles
      );
      awxRolesData.push(...(awxRoles as (AwxRbacRole & { remove?: boolean })[]));
      const edaRoles = getAddedAndRemovedRoles(
        selectedEdaRoles as (AwxRbacRole & RemoveRole)[],
        updatedEdaRoles
      );
      edaRolesData.push(...(edaRoles as (EdaRbacRole & { remove?: boolean })[]));
    } else {
      awxRolesData.push(...updatedAwxRoles);
      edaRolesData.push(...updatedEdaRoles);
    }

    const awxTeamRolePairs: TeamAndAwxRole[] = [];
    if (awxRolesData) {
      for (const awxRole of awxRolesData) {
        awxTeamRolePairs.push({ team, awxRole });
      }
    }
    const edaTeamRolePairs: TeamAndEdaRole[] = [];
    if (edaRolesData) {
      for (const edaRole of edaRolesData) {
        edaTeamRolePairs.push({ team, edaRole });
      }
    }
    const items = [...awxTeamRolePairs, ...edaTeamRolePairs];

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
        keyFn: (item) =>
          (item as TeamAndAwxRole).awxRole
            ? `${item.team.id}_${(item as TeamAndAwxRole).awxRole.id}`
            : `${item.team.id}_${(item as TeamAndEdaRole).edaRole.id}`,
        items,
        actionColumns: [
          {
            header: t('Role'),
            cell: (item) =>
              (item as TeamAndAwxRole).awxRole
                ? (item as TeamAndAwxRole).awxRole.name
                : (item as TeamAndEdaRole).edaRole.name,
          },
          {
            header: t('Assignment type'),
            cell: (item) => {
              if ((item as TeamAndAwxRole).awxRole) {
                return (item as TeamAndAwxRole).awxRole.remove ? t('Removed') : t('Added');
              } else {
                return (item as TeamAndEdaRole).edaRole.remove ? t('Removed') : t('Added');
              }
            },
          },
        ],
        actionFn: progressDialogActionFunction,
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
      <PageWizard<WizardFormValues>
        steps={steps}
        onSubmit={onSubmit}
        onCancel={() => {
          pageNavigate(PlatformRoute.OrganizationTeams, {
            params: { id: organization.id.toString() },
          });
        }}
        defaultValue={defaultValue}
        disableGrid
      />
    </PageLayout>
  );
}
