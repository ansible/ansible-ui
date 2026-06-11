import {
  LoadingPage,
  PageHeader,
  PageLayout,
  PageWizard,
  PageWizardStep,
  useGetPageUrl,
  usePageNavigate,
} from '@ansible/ansible-ui-framework';
import { PlatformSelectTeamsStep } from '@ansible/common-ui/access/components/PlatformSelectTeamsStep';
import { RoleAssignmentsReviewStep } from '@ansible/common-ui/access/RolesWizard/steps/RoleAssignmentsReviewStep';
import { postRequest } from '@ansible/common-ui/crud/Data';
import { useGet } from '@ansible/common-ui/crud/useGet';
import { PlatformSelectRolesStep } from '@ansible/platform-ui/access/organizations/components/PlatformSelectRolesStep';
import { PlatformRbacRole } from '@ansible/platform-ui/interfaces/PlatformRbacRole';
import { PlatformTeam } from '@ansible/platform-ui/interfaces/PlatformTeam';
import { gatewayAPI } from '@ansible/platform-ui/utils/gateway-api-utils';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { awxErrorAdapter } from '../../../common/adapters/awxErrorAdapter';
import { awxAPI } from '../../../common/api/awx-utils';
import { useAwxBulkActionDialog } from '../../../common/useAwxBulkActionDialog';
import { Inventory } from '../../../interfaces/Inventory';
import { AwxRoute } from '../../../main/AwxRoutes';

interface WizardFormValues {
  teams: PlatformTeam[];
  platformRoles: PlatformRbacRole[];
}

interface TeamRolePair {
  team: PlatformTeam;
  role: PlatformRbacRole;
}

export function InventoryAssignTeams() {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const params = useParams<{ id: string }>();
  const pageNavigate = usePageNavigate();
  const { data: inventory, isLoading } = useGet<Inventory>(
    awxAPI`/inventories/${params.id ?? ''}/`
  );
  const userProgressDialog = useAwxBulkActionDialog<TeamRolePair>();

  if (isLoading || !inventory) return <LoadingPage />;

  const steps: PageWizardStep[] = [
    {
      id: 'teams',
      label: t('Select team(s)'),
      inputs: (
        <PlatformSelectTeamsStep
          descriptionForTeamsSelection={t(
            'Select the team(s) that you want to give access to {{inventoryName}}.',
            {
              inventoryName: inventory?.name,
            }
          )}
        />
      ),
      validate: (formData, _) => {
        const { teams } = formData as { teams: PlatformTeam[] };
        if (!teams?.length) {
          throw new Error(t('Select at least one team.'));
        }
      },
    },
    {
      id: 'platformRoles',
      label: t('Select roles to apply'),
      inputs: (
        <PlatformSelectRolesStep
          contentType="awx.inventory"
          fieldNameForPreviousStep="teams"
          descriptionForRoleSelection={t('Choose roles to apply to {{inventoryName}}.', {
            inventoryName: inventory?.name,
          })}
        />
      ),
      validate: (formData, _) => {
        const { platformRoles } = formData as { platformRoles: PlatformRbacRole[] };
        if (!platformRoles?.length) {
          throw new Error(t('Select at least one role.'));
        }
      },
    },
    {
      id: 'review',
      label: t('Review'),
      inputs: <RoleAssignmentsReviewStep />,
    },
  ];

  const onSubmit = async (data: WizardFormValues) => {
    const { teams, platformRoles } = data;
    const items: TeamRolePair[] = [];
    for (const team of teams) {
      for (const role of platformRoles) {
        items.push({ team, role });
      }
    }
    return new Promise<void>((resolve) => {
      userProgressDialog({
        title: t('Assign teams'),
        keyFn: ({ team, role }) => `${team.id}_${role.id}`,
        items,
        actionColumns: [
          { header: t('Team'), cell: ({ team }) => team.name },
          { header: t('Role'), cell: ({ role }) => role.name },
        ],
        actionFn: ({ team, role }) =>
          postRequest(gatewayAPI`/role_team_assignments/`, {
            team: team.id,
            role_definition: role.id,
            content_type: 'awx.inventory',
            object_id: inventory.id,
          }),
        onComplete: () => {
          resolve();
        },
        onClose: () => {
          pageNavigate(AwxRoute.InventoryTeamAccess, {
            params: { id: inventory.id.toString() },
          });
        },
      });
    });
  };

  return (
    <PageLayout>
      <PageHeader
        title={t('Assign teams')}
        breadcrumbs={[
          { label: t('Inventories'), to: getPageUrl(AwxRoute.Inventories) },
          {
            label: inventory?.name,
            to: getPageUrl(AwxRoute.InventoryDetails, { params: { id: inventory?.id } }),
          },
          {
            label: t('Team Access'),
            to: getPageUrl(AwxRoute.InventoryTeamAccess, { params: { id: inventory?.id } }),
          },
          { label: t('Assign teams') },
        ]}
      />
      <PageWizard<WizardFormValues>
        errorAdapter={awxErrorAdapter}
        steps={steps}
        onSubmit={onSubmit}
        disableGrid
        onCancel={() => {
          pageNavigate(AwxRoute.InventoryTeamAccess, { params: { id: inventory?.id } });
        }}
      />
    </PageLayout>
  );
}
