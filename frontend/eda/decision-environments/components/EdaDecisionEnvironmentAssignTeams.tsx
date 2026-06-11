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
import { edaAPI } from '../../common/eda-utils';
import { edaErrorAdapter } from '../../common/edaErrorAdapter';
import { useEdaBulkActionDialog } from '../../common/useEdaBulkActionDialog';
import { EdaDecisionEnvironment } from '../../interfaces/EdaDecisionEnvironment';
import { EdaTeam } from '../../interfaces/EdaTeam';
import { EdaRoute } from '../../main/EdaRoutes';

interface WizardFormValues {
  teams: EdaTeam[];
  platformRoles: PlatformRbacRole[];
}

interface TeamRolePair {
  team: EdaTeam;
  role: PlatformRbacRole;
}

export function EdaDecisionEnvironmentAssignTeams() {
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
        <PlatformSelectTeamsStep
          descriptionForTeamsSelection={t(
            'Select the team(s) that you want to give access to {{decisionEnvironmentName}}.',
            {
              decisionEnvironmentName: decisionEnvironment.name,
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
          contentType="eda.decisionenvironment"
          fieldNameForPreviousStep="teams"
          descriptionForRoleSelection={t('Choose roles to apply to {{decisionEnvironmentName}}.', {
            decisionEnvironmentName: decisionEnvironment.name,
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
        title={t('Assign teams')}
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
          { label: t('Assign teams') },
        ]}
      />
      <PageWizard<WizardFormValues>
        errorAdapter={edaErrorAdapter}
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
