import { useTranslation } from 'react-i18next';
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
import { postRequest } from '../../../../frontend/common/crud/Data';
import { awxAPI } from '../../../../frontend/awx/common/api/awx-utils';
import { edaAPI } from '../../../../frontend/eda/common/eda-utils';
import { PlatformRoute } from '../../../main/PlatformRoutes';
import { useGatewayService } from '../../../main/GatewayServices';
import { useMemo } from 'react';
import { PlatformSelectOrganizationTeamsStep } from '../roles-wizard-steps/PlatformSelectOrganizationTeamsStep';
import { PlatformTeam } from '../../../interfaces/PlatformTeam';

interface WizardFormValues {
  teams: PlatformTeam[];
  awxRoles: AwxRbacRole[];
  edaRoles: EdaRbacRole[];
}

interface TeamAndAwxRole {
  team: PlatformTeam;
  awxRole: AwxRbacRole;
}
interface TeamAndEdaRole {
  team: PlatformTeam;
  edaRole: EdaRbacRole;
}

export function PlatformOrganizationTeamsAddRoles() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const getPageUrl = useGetPageUrl();
  const pageNavigate = usePageNavigate();
  const progressDialog = useAwxBulkActionDialog<TeamAndAwxRole | TeamAndEdaRole>();
  const { data: organization, isLoading } = useGet<PlatformOrganization>(
    gatewayV1API`/organizations/${params.id || ''}/`
  );
  const awxService = useGatewayService('controller');
  const edaService = useGatewayService('eda');

  const steps = useMemo<PageWizardStep[]>(
    () => [
      {
        id: 'teams',
        label: t('Select team(s)'),
        inputs: <PlatformSelectOrganizationTeamsStep />,
        validate: (formData, _) => {
          const { teams } = formData as { teams: PlatformTeam[] };
          if (!teams?.length) {
            throw new Error(t('Select at least one team.'));
          }
        },
      },
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
                      fieldNameForPreviousStep="teams"
                      descriptionForRoleSelection={t(
                        'Select the roles that you want to apply to the selected teams.'
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
                      fieldNameForPreviousStep="teams"
                      descriptionForRoleSelection={t(
                        'Select the roles that you want to apply to the selected teams.'
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
                  fieldNameForPreviousStep="teams"
                  descriptionForRoleSelection={t(
                    'Select the roles that you want to apply to the selected teams.'
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
                  fieldNameForPreviousStep="teams"
                  descriptionForRoleSelection={t(
                    'Select the roles that you want to apply to the selected teams.'
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
          />
        ),
      },
    ],
    [awxService, edaService, t]
  );

  if (isLoading || !organization) return <LoadingPage />;

  const onSubmit = (data: WizardFormValues) => {
    const { teams, awxRoles, edaRoles } = data;

    const awxUserRolePairs: TeamAndAwxRole[] = [];
    if (awxRoles) {
      for (const team of teams) {
        for (const awxRole of awxRoles) {
          awxUserRolePairs.push({ team, awxRole });
        }
      }
    }
    const edaUserRolePairs: TeamAndEdaRole[] = [];
    if (edaRoles) {
      for (const team of teams) {
        for (const edaRole of edaRoles) {
          edaUserRolePairs.push({ team, edaRole });
        }
      }
    }

    const items = [...awxUserRolePairs, ...edaUserRolePairs];

    return new Promise<void>((resolve) => {
      progressDialog({
        title: t('Add roles'),
        keyFn: (item) =>
          (item as TeamAndAwxRole).awxRole
            ? `${item.team.id}_${(item as TeamAndAwxRole).awxRole.id}`
            : `${item.team.id}_${(item as TeamAndEdaRole).edaRole.id}`,
        items,
        actionColumns: [
          { header: t('Name'), cell: ({ team }) => team.name },
          {
            header: t('Role'),
            cell: (item) =>
              (item as TeamAndAwxRole).awxRole
                ? (item as TeamAndAwxRole).awxRole.name
                : (item as TeamAndEdaRole).edaRole.name,
          },
        ],
        actionFn: (item) => {
          if ((item as TeamAndAwxRole).awxRole) {
            return postRequest(awxAPI`/role_team_assignments/`, {
              team_ansible_id: item.team.summary_fields.resource.ansible_id,
              role_definition: (item as TeamAndAwxRole).awxRole.id,
              content_type: 'shared.organization',
              object_ansible_id: organization?.summary_fields?.resource?.ansible_id || '',
            });
          } else {
            return postRequest(edaAPI`/role_team_assignments/`, {
              team_ansible_id: item.team.summary_fields.resource.ansible_id,
              role_definition: (item as TeamAndEdaRole).edaRole.id,
              content_type: 'shared.organization',
              object_ansible_id: organization?.summary_fields?.resource?.ansible_id || '',
            });
          }
        },
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
        title={t('Add roles')}
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
          { label: t('Add roles') },
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
        disableGrid
      />
    </PageLayout>
  );
}
