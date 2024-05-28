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
import { AwxSelectTeamsStep } from '../../access/common/AwxRolesWizardSteps/AwxSelectTeamsStep';
import { Team } from '../../interfaces/Team';
import { AwxSelectRolesStep } from '../../access/common/AwxRolesWizardSteps/AwxSelectRolesStep';
import { useGet } from '../../../common/crud/useGet';
import { InstanceGroup } from '../../interfaces/InstanceGroup';
import { awxAPI } from '../../common/api/awx-utils';
import { postRequest } from '../../../common/crud/Data';
import { RoleAssignmentsReviewStep } from '../../../common/access/RolesWizard/steps/RoleAssignmentsReviewStep';
import { Role } from '../../interfaces/Role';
import { AwxRoute } from '../../main/AwxRoutes';
import { useAwxBulkActionDialog } from '../../common/useAwxBulkActionDialog';

interface WizardFormValues {
  teams: Team[];
  awxRoles: Role[];
}

interface TeamRolePair {
  team: Team;
  role: Role;
}

export function InstanceGroupAddTeams() {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const params = useParams<{ id: string }>();
  const pageNavigate = usePageNavigate();
  const { data: instanceGroup, isLoading } = useGet<InstanceGroup>(
    awxAPI`/instance_groups/${params.id ?? ''}/`
  );
  const teamRoleProgressDialog = useAwxBulkActionDialog<TeamRolePair>();

  if (isLoading || !instanceGroup) return <LoadingPage />;

  const steps: PageWizardStep[] = [
    {
      id: 'teams',
      label: t('Select team(s)'),
      inputs: (
        <AwxSelectTeamsStep
          descriptionForTeamsSelection={t(
            'Select the team(s) that you want to give access to {{instanceGroupName}}.',
            {
              instanceGroupName: instanceGroup?.name,
            }
          )}
        />
      ),
      validate: (formData, _) => {
        const { teams } = formData as WizardFormValues;
        if (!teams?.length) {
          throw new Error(t('Select at least one team.'));
        }
      },
    },
    {
      id: 'roles',
      label: t('Select roles to apply'),
      inputs: (
        <AwxSelectRolesStep
          contentType="instancegroup"
          fieldNameForPreviousStep="teams"
          descriptionForRoleSelection={t('Choose roles to apply to {{instanceGroupName}}.', {
            instanceGroupName: instanceGroup?.name,
          })}
        />
      ),
      validate: (formData, _) => {
        const { awxRoles } = formData as WizardFormValues;
        if (!awxRoles?.length) {
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
    const { teams, awxRoles } = data;
    const items: TeamRolePair[] = [];
    for (const team of teams) {
      for (const role of awxRoles) {
        items.push({ team, role });
      }
    }
    return new Promise<void>((resolve) => {
      teamRoleProgressDialog({
        title: t('Add roles'),
        keyFn: ({ team, role }) => `${team.id}_${role.id}`,
        items,
        actionColumns: [
          { header: t('Team'), cell: ({ team }) => team.name },
          { header: t('Role'), cell: ({ role }) => role.name },
        ],
        actionFn: ({ team, role }) =>
          postRequest(awxAPI`/role_team_assignments/`, {
            team: team.id,
            role_definition: role.id,
            content_type: 'instancegroup',
            object_id: instanceGroup.id,
          }),
        onComplete: () => {
          resolve();
        },
        onClose: () => {
          pageNavigate(AwxRoute.InstanceGroupTeamAccess, {
            params: { id: instanceGroup.id.toString() },
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
          { label: t('Instance groups'), to: getPageUrl(AwxRoute.InstanceGroups) },
          {
            label: instanceGroup?.name,
            to: getPageUrl(AwxRoute.InstanceGroupDetails, {
              params: {
                id: instanceGroup?.id,
              },
            }),
          },
          {
            label: t('Team access'),
            to: getPageUrl(AwxRoute.InstanceGroupTeamAccess, { params: { id: instanceGroup?.id } }),
          },
          { label: t('Add roles') },
        ]}
      />
      <PageWizard<WizardFormValues>
        steps={steps}
        onSubmit={onSubmit}
        disableGrid
        onCancel={() => {
          pageNavigate(AwxRoute.InstanceGroupTeamAccess, { params: { id: instanceGroup?.id } });
        }}
      />
    </PageLayout>
  );
}
