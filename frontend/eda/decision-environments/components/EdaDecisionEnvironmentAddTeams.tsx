import { useTranslation } from 'react-i18next';
import {
  LoadingPage,
  PageHeader,
  PageLayout,
  PageWizard,
  PageWizardStep,
  useGetPageUrl,
  usePageNavigate,
} from '../../../../framework';
import { EdaTeam } from '../../interfaces/EdaTeam';
import { useParams } from 'react-router-dom';
import { useGet } from '../../../common/crud/useGet';
import { EdaDecisionEnvironment } from '../../interfaces/EdaDecisionEnvironment';
import { edaAPI } from '../../common/eda-utils';
import { postRequest } from '../../../common/crud/Data';
import { RoleAssignmentsReviewStep } from '../../../common/access/RolesWizard/steps/RoleAssignmentsReviewStep';
import { EdaRbacRole } from '../../interfaces/EdaRbacRole';
import { EdaRoute } from '../../main/EdaRoutes';
import { useEdaBulkActionDialog } from '../../common/useEdaBulkActionDialog';
import { EdaSelectRolesStep } from '../../access/common/EdaRolesWizardSteps/EdaSelectRolesStep';
import { EdaSelectTeamsStep } from '../../access/common/EdaRolesWizardSteps/EdaSelectTeamsStep';

interface WizardFormValues {
  teams: EdaTeam[];
  edaRoles: EdaRbacRole[];
}

interface TeamRolePair {
  team: EdaTeam;
  role: EdaRbacRole;
}

export function EdaDecisionEnvironmentAddTeams() {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const params = useParams<{ id: string }>();
  const pageNavigate = usePageNavigate();
  const { data: decisionEnvironment, isLoading } = useGet<EdaDecisionEnvironment>(
    edaAPI`/decision-environments/${params.id ?? ''}/`
  );
  const userProgressDialog = useEdaBulkActionDialog<TeamRolePair>();

  if (isLoading || !decisionEnvironment) return <LoadingPage />;

  const steps: PageWizardStep[] = [
    {
      id: 'teams',
      label: t('Select team(s)'),
      inputs: (
        <EdaSelectTeamsStep
          descriptionForTeamsSelection={t(
            'Select the team(s) that you want to give access to {{decisionEnvironmentName}}.',
            {
              decisionEnvironmentName: decisionEnvironment.name,
            }
          )}
        />
      ),
      validate: (formData, _) => {
        const { teams } = formData as { teams: EdaTeam[] };
        if (!teams?.length) {
          throw new Error(t('Select at least one team.'));
        }
      },
    },
    {
      id: 'roles',
      label: t('Select roles to apply'),
      inputs: (
        <EdaSelectRolesStep
          contentType="decisionenvironment"
          fieldNameForPreviousStep="teams"
          descriptionForRoleSelection={t('Choose roles to apply to {{decisionEnvironmentName}}.', {
            decisionEnvironmentName: decisionEnvironment.name,
          })}
        />
      ),
      validate: (formData, _) => {
        const { edaRoles } = formData as { edaRoles: EdaRbacRole[] };
        if (!edaRoles?.length) {
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
    const { teams, edaRoles } = data;
    const items: TeamRolePair[] = [];
    for (const team of teams) {
      for (const role of edaRoles) {
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
          postRequest(edaAPI`/role_team_assignments/`, {
            team: team.id,
            role_definition: role.id,
            content_type: 'eda.decision-environment',
            object_id: decisionEnvironment.id,
          }),
        onComplete: () => {
          resolve();
        },
        onClose: () => {
          pageNavigate(EdaRoute.DecisionEnvironmentTeamAccess, {
            params: { id: decisionEnvironment.id.toString() },
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
          { label: t('DecisionEnvironments'), to: getPageUrl(EdaRoute.DecisionEnvironments) },
          {
            label: decisionEnvironment.name,
            to: getPageUrl(EdaRoute.DecisionEnvironmentDetails, {
              params: { id: decisionEnvironment.id },
            }),
          },
          {
            label: t('Team Access'),
            to: getPageUrl(EdaRoute.DecisionEnvironmentTeamAccess, {
              params: { id: decisionEnvironment.id },
            }),
          },
          { label: t('Add roles') },
        ]}
      />
      <PageWizard<WizardFormValues>
        steps={steps}
        onSubmit={onSubmit}
        disableGrid
        onCancel={() => {
          pageNavigate(EdaRoute.DecisionEnvironmentTeamAccess, {
            params: { id: decisionEnvironment.id },
          });
        }}
      />
    </PageLayout>
  );
}
