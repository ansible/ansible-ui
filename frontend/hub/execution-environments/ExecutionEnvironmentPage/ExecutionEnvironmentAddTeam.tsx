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
import { RoleAssignmentsReviewStep } from '../../../common/access/RolesWizard/steps/RoleAssignmentsReviewStep';
import { postRequest } from '../../../common/crud/Data';
import { useGet } from '../../../common/crud/useGet';
import { HubUserGroup } from '../../interfaces/expanded/HubUser';
import { HubRbacRole } from '../../interfaces/expanded/HubRbacRole';
import { hubAPI } from '../../common/api/formatPath';
import { useHubBulkActionDialog } from '../../common/useHubBulkActionDialog';
import { HubError } from '../../common/HubError';
import { HubSelectTeamsStep } from '../../access/common/HubRoleWizardSteps/HubSelectTeamsStep';
import { HubRoute } from '../../main/HubRoutes';
import { hubErrorAdapter } from '../../common/adapters/hubErrorAdapter';
import { HubSelectRolesStep } from '../../access/common/HubRoleWizardSteps/HubSelectRolesStep';
import { ExecutionEnvironment } from '../ExecutionEnvironment';

interface WizardFormValues {
  teams: HubUserGroup[]; // Assuming groups will map to team
  hubRoles: HubRbacRole[];
}

interface TeamRolePair {
  team: HubUserGroup;
  role: HubRbacRole;
}

export function ExecutionEnvironmentAddTeams() {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const params = useParams<{ id: string }>();
  const pageNavigate = usePageNavigate();
  const teamProgressDialog = useHubBulkActionDialog<TeamRolePair>();

  const { data, error, refresh } = useGet<Partial<ExecutionEnvironment>>(
    hubAPI`/v3/plugin/execution-environments/repositories/${params.id ?? ''}/`
  );

  let executionEnvironment: Partial<ExecutionEnvironment> | undefined = undefined;
  if (data && Object.keys(data).length > 0) {
    executionEnvironment = data;
  }

  if (!data && !error) {
    return <LoadingPage />;
  }

  if (error) {
    return <HubError error={error} handleRefresh={refresh} />;
  }

  const steps: PageWizardStep[] = [
    {
      id: 'teams',
      label: t('Select team(s)'),
      inputs: (
        <HubSelectTeamsStep
          descriptionForTeamsSelection={t(
            'Select the team(s) that you want to give access to {{executionEnvironment}}.',
            {
              executionEnvironment: executionEnvironment?.name,
            }
          )}
        />
      ),
      validate: (formData, _) => {
        const { teams } = formData as { teams: HubUserGroup[] };
        if (!teams?.length) {
          throw new Error(t('Select at least one team.'));
        }
      },
    },
    {
      id: 'roles',
      label: t('Select roles to apply'),
      inputs: (
        <HubSelectRolesStep
          contentType="containernamespace"
          fieldNameForPreviousStep="teams"
          descriptionForRoleSelection={t('Choose roles to apply to {{executionEnvironment}}.', {
            executionEnvironment: executionEnvironment?.name,
          })}
        />
      ),
      validate: (formData, _) => {
        const { hubRoles } = formData as { hubRoles: HubRbacRole[] };
        if (!hubRoles?.length) {
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
    const { teams, hubRoles } = data;
    const items: TeamRolePair[] = [];
    for (const team of teams) {
      for (const role of hubRoles) {
        items.push({ team, role });
      }
    }
    return new Promise<void>((resolve) => {
      teamProgressDialog({
        title: t('Add roles'),
        keyFn: ({ team, role }) => `${team.id}_${role.id}`,
        items,
        actionColumns: [
          { header: t('Team'), cell: ({ team }) => team.name },
          { header: t('Role'), cell: ({ role }) => role.name },
        ],
        actionFn: ({ team, role }) =>
          postRequest(hubAPI`/_ui/v2/role_team_assignments/`, {
            team: team.id,
            role_definition: role.id,
            content_type: 'containernamespace', // Verify this one?
            object_id: executionEnvironment?.id,
          }),
        onComplete: () => {
          resolve();
        },
        onClose: () => {
          pageNavigate(HubRoute.ExecutionEnvironmentTeamAccess, {
            params: { id: executionEnvironment?.name },
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
          { label: t('Execution environments'), to: getPageUrl(HubRoute.ExecutionEnvironments) },
          {
            label: executionEnvironment?.name,
            to: getPageUrl(HubRoute.ExecutionEnvironmentDetails, {
              params: { id: executionEnvironment?.name },
            }),
          },
          {
            label: t('Team Access'),
            to: getPageUrl(HubRoute.ExecutionEnvironmentTeamAccess, {
              params: { id: executionEnvironment?.name },
            }),
          },
          { label: t('Add roles') },
        ]}
      />
      <PageWizard<WizardFormValues>
        errorAdapter={hubErrorAdapter}
        steps={steps}
        onSubmit={onSubmit}
        disableGrid
        onCancel={() => {
          pageNavigate(HubRoute.ExecutionEnvironmentTeamAccess, {
            params: { id: executionEnvironment?.name },
          });
        }}
      />
    </PageLayout>
  );
}
