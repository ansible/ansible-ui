import {
  LoadingPage,
  PageHeader,
  PageLayout,
  PageWizard,
  PageWizardStep,
  useGetPageUrl,
  usePageNavigate,
} from '@ansible/ansible-ui-framework';
import { RoleAssignmentsReviewStep } from '@ansible/common-ui/access/RolesWizard/steps/RoleAssignmentsReviewStep';
import { postRequest } from '@ansible/common-ui/crud/Data';
import { useGet } from '@ansible/common-ui/crud/useGet';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
import { awxErrorAdapter } from '../../../common/adapters/awxErrorAdapter';
import { awxAPI } from '../../../common/api/awx-utils';
import { useAwxBulkActionDialog } from '../../../common/useAwxBulkActionDialog';
import { Credential } from '../../../interfaces/Credential';
import { AwxRoute } from '../../../main/AwxRoutes';
import { PlatformSelectRolesStep } from '@ansible/platform-ui/access/organizations/components/PlatformSelectRolesStep';
import { PlatformRbacRole } from '@ansible/platform-ui/interfaces/PlatformRbacRole';
import { PlatformSelectTeamsStep } from '@ansible/common-ui/access/components/PlatformSelectTeamsStep';
import { PlatformTeam } from '@ansible/platform-ui/interfaces/PlatformTeam';
import { gatewayAPI } from '@ansible/platform-ui/utils/gateway-api-utils';

interface WizardFormValues {
  teams: PlatformTeam[];
  platformRoles: PlatformRbacRole[];
}

interface TeamRolePair {
  team: PlatformTeam;
  role: PlatformRbacRole;
}

export function CredentialAssignTeams() {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const params = useParams<{ id: string }>();
  const pageNavigate = usePageNavigate();
  const { data: credential, isLoading } = useGet<Credential>(
    awxAPI`/credentials/${params.id ?? ''}/`
  );
  const userProgressDialog = useAwxBulkActionDialog<TeamRolePair>();

  if (isLoading || !credential) return <LoadingPage />;

  const steps: PageWizardStep[] = [
    {
      id: 'teams',
      label: t('Select team(s)'),
      inputs: (
        <PlatformSelectTeamsStep
          descriptionForTeamsSelection={t(
            'Select the team(s) that you want to give access to {{inventoryName}}.',
            {
              credentialName: credential?.name,
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
          contentType="awx.credential"
          fieldNameForPreviousStep="teams"
          descriptionForRoleSelection={t('Choose roles to apply to {{credentialName}}.', {
            credentialName: credential?.name,
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
            content_type: 'awx.credential',
            object_id: credential.id,
          }),
        onComplete: () => {
          resolve();
        },
        onClose: () => {
          pageNavigate(AwxRoute.CredentialTeamAccess, {
            params: { id: credential.id.toString() },
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
          { label: t('Credentials'), to: getPageUrl(AwxRoute.Credentials) },
          {
            label: credential?.name,
            to: getPageUrl(AwxRoute.CredentialDetails, { params: { id: credential?.id } }),
          },
          {
            label: t('Team Access'),
            to: getPageUrl(AwxRoute.CredentialTeamAccess, { params: { id: credential?.id } }),
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
          pageNavigate(AwxRoute.CredentialTeamAccess, { params: { id: credential?.id } });
        }}
      />
    </PageLayout>
  );
}
