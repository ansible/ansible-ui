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
} from '../../../../../framework';
import { RoleAssignmentsReviewStep } from '../../../../common/access/RolesWizard/steps/RoleAssignmentsReviewStep';
import { postRequest } from '../../../../common/crud/Data';
import { useGet } from '../../../../common/crud/useGet';
import { EdaSelectRolesStep } from '../../../access/common/EdaRolesWizardSteps/EdaSelectRolesStep';
import { EdaSelectTeamsStep } from '../../../access/common/EdaRolesWizardSteps/EdaSelectTeamsStep';
import { edaAPI } from '../../../common/eda-utils';
import { useEdaBulkActionDialog } from '../../../common/useEdaBulkActionDialog';
import { EdaRbacRole } from '../../../interfaces/EdaRbacRole';
import { EdaCredentialType } from '../../../interfaces/EdaCredentialType';
import { EdaTeam } from '../../../interfaces/EdaTeam';
import { EdaRoute } from '../../../main/EdaRoutes';

interface WizardFormValues {
  teams: EdaTeam[];
  edaRoles: EdaRbacRole[];
}

interface TeamRolePair {
  team: EdaTeam;
  role: EdaRbacRole;
}

export function EdaCredentialTypeAddTeams() {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const params = useParams<{ id: string }>();
  const pageNavigate = usePageNavigate();
  const { data: credentialType, isLoading } = useGet<EdaCredentialType>(
    edaAPI`/credential-types/${params.id ?? ''}/`
  );
  const teamRoleProgressDialog = useEdaBulkActionDialog<TeamRolePair>();

  if (isLoading || !credentialType) return <LoadingPage />;

  const steps: PageWizardStep[] = [
    {
      id: 'teams',
      label: t('Select team(s)'),
      inputs: (
        <EdaSelectTeamsStep
          descriptionForTeamsSelection={t(
            'Select the team(s) that you want to give access to {{credentialTypeName}}.',
            {
              credentialTypeName: credentialType?.name,
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
          contentType="credentialtype"
          fieldNameForPreviousStep="teams"
          descriptionForRoleSelection={t('Choose roles to apply to {{credentialTypeName}}.', {
            credentialTypeName: credentialType?.name,
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
      teamRoleProgressDialog({
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
            content_type: 'eda.credentialtype',
            object_id: credentialType.id,
          }),
        onComplete: () => {
          resolve();
        },
        onClose: () => {
          pageNavigate(EdaRoute.CredentialTypeTeamAccess, {
            params: { id: credentialType.id.toString() },
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
          { label: t('Rulebook Activations'), to: getPageUrl(EdaRoute.CredentialTypes) },
          {
            label: credentialType?.name,
            to: getPageUrl(EdaRoute.CredentialTypeDetails, { params: { id: credentialType?.id } }),
          },
          {
            label: t('Team Access'),
            to: getPageUrl(EdaRoute.CredentialTypeTeamAccess, {
              params: { id: credentialType?.id },
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
          pageNavigate(EdaRoute.CredentialTypeTeamAccess, { params: { id: credentialType?.id } });
        }}
      />
    </PageLayout>
  );
}
