import {
  LoadingPage,
  PageHeader,
  PageLayout,
  PageWizard,
  PageWizardStep,
  useGetPageUrl,
  usePageNavigate,
} from '@ansible/ansible-ui-framework';
import { useAwxBulkActionDialog } from '@ansible/awx-ui/common/useAwxBulkActionDialog';
import { AwxRbacRole } from '@ansible/awx-ui/interfaces/AwxRbacRole';
import { PlatformRoleAssignmentsReviewStep } from '@ansible/common-ui/access/RolesWizard/steps/PlatformRoleAssignmentsReviewStep';
import { postRequest } from '@ansible/common-ui/crud/Data';
import { useGet } from '@ansible/common-ui/crud/useGet';
import { EdaRbacRole } from '@ansible/eda-ui/interfaces/EdaRbacRole';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { PlatformOrganization } from '../../../interfaces/PlatformOrganization';
import { PlatformTeam } from '../../../interfaces/PlatformTeam';
import { PlatformRoute } from '../../../main/PlatformRoutes';
import { gatewayAPI } from '../../../utils/gateway-api-utils';
import { PlatformSelectOrganizationRolesStep } from '../roles-wizard-steps/PlatformSelectOrganizationRolesStep';
import { PlatformSelectOrganizationTeamsStep } from '../roles-wizard-steps/PlatformSelectOrganizationTeamsStep';

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
    gatewayAPI`/organizations/${params.id || ''}/`
  );

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
      {
        id: 'roles',
        label: t('Select organization roles'),
        inputs: <PlatformSelectOrganizationRolesStep />,
      },
      {
        id: 'review',
        label: t('Review'),
        element: <PlatformRoleAssignmentsReviewStep />,
      },
    ],
    [t]
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
        title: t('Assign organization roles'),
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
            return postRequest(gatewayAPI`/role_team_assignments/`, {
              team_ansible_id: item.team.summary_fields.resource.ansible_id,
              role_definition: (item as TeamAndAwxRole).awxRole.id,
              content_type: 'shared.organization',
              object_ansible_id: organization?.summary_fields?.resource?.ansible_id || '',
            });
          } else {
            return postRequest(gatewayAPI`/role_team_assignments/`, {
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
        title={t('Assign organization roles')}
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
          { label: t('Assign organization roles') },
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
