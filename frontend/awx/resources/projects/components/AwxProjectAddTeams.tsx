import { useTranslation } from 'react-i18next';
import {
  LoadingPage,
  PageHeader,
  PageLayout,
  PageWizard,
  PageWizardStep,
  useGetPageUrl,
  usePageNavigate,
} from '../../../../../framework';
import { Team } from '../../../interfaces/Team';
import { useParams } from 'react-router-dom';
import { useGet } from '../../../../common/crud/useGet';
import { Project } from '../../../interfaces/Project';
import { postRequest } from '../../../../common/crud/Data';
import { RoleAssignmentsReviewStep } from '../../../../common/access/RolesWizard/steps/RoleAssignmentsReviewStep';
import { useAwxBulkActionDialog } from '../../../common/useAwxBulkActionDialog';
import { AwxSelectTeamsStep } from '../../../access/common/AwxRolesWizardSteps/AwxSelectTeamsStep';
import { awxAPI } from '../../../common/api/awx-utils';
import { AwxRoute } from '../../../main/AwxRoutes';
import { AwxSelectRolesStep } from '../../../access/common/AwxRolesWizardSteps/AwxSelectRolesStep';
import { AwxRole } from '../../../access/roles/AwxRoles';

interface WizardFormValues {
  teams: Team[];
  awxRoles: AwxRole[];
}

interface TeamRolePair {
  team: Team;
  role: AwxRole;
}

export function AwxProjectAddTeams() {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const params = useParams<{ id: string }>();
  const pageNavigate = usePageNavigate();
  const { data: project, isLoading } = useGet<Project>(awxAPI`/projects/${params.id ?? ''}/`);
  const userProgressDialog = useAwxBulkActionDialog<TeamRolePair>();

  if (isLoading || !project) return <LoadingPage />;

  const steps: PageWizardStep[] = [
    {
      id: 'teams',
      label: t('Select team(s)'),
      inputs: (
        <AwxSelectTeamsStep
          descriptionForTeamsSelection={t(
            'Select the team(s) that you want to give access to {{projectName}}.',
            {
              projectName: project?.name,
            }
          )}
        />
      ),
      validate: (formData, _) => {
        const { teams } = formData as { teams: Team[] };
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
          contentType="project"
          fieldNameForPreviousStep="teams"
          descriptionForRoleSelection={t('Choose roles to apply to {{projectName}}.', {
            projectName: project?.name,
          })}
        />
      ),
      validate: (formData, _) => {
        const { awxRoles } = formData as { awxRoles: AwxRole[] };
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
      userProgressDialog({
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
            content_type: 'project',
            object_id: project.id,
          }),
        onComplete: () => {
          resolve();
        },
        onClose: () => {
          pageNavigate(AwxRoute.ProjectTeams, {
            params: { id: project.id.toString() },
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
          { label: t('Projects'), to: getPageUrl(AwxRoute.Projects) },
          {
            label: project?.name,
            to: getPageUrl(AwxRoute.ProjectDetails, { params: { id: project?.id } }),
          },
          {
            label: t('Team Access'),
            to: getPageUrl(AwxRoute.ProjectTeams, { params: { id: project?.id } }),
          },
          { label: t('Add roles') },
        ]}
      />
      <PageWizard<WizardFormValues>
        steps={steps}
        onSubmit={onSubmit}
        disableGrid
        onCancel={() => {
          pageNavigate(AwxRoute.ProjectTeams, { params: { id: project?.id } });
        }}
      />
    </PageLayout>
  );
}
