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
import { HubSelectRolesStep } from '../../access/common/HubRoleWizardSteps/HubSelectRolesStep';
import { HubSelectTeamsStep } from '../../access/common/HubRoleWizardSteps/HubSelectTeamsStep';
import { hubErrorAdapter } from '../../common/adapters/hubErrorAdapter';
import { hubAPI } from '../../common/api/formatPath';
import { HubError } from '../../common/HubError';
import { useHubBulkActionDialog } from '../../common/useHubBulkActionDialog';
import { HubItemsResponse } from '../../common/useHubView';
import { HubRbacRole } from '../../interfaces/expanded/HubRbacRole';
import { HubUserGroup } from '../../interfaces/expanded/HubUser';
import { HubRoute } from '../../main/HubRoutes';
import { HubNamespace } from '../HubNamespace';

interface WizardFormValues {
  teams: HubUserGroup[]; // Assuming groups will map to team
  hubRoles: HubRbacRole[];
}

interface TeamRolePair {
  team: HubUserGroup;
  role: HubRbacRole;
}

export function HubNamespaceAssignTeams() {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const params = useParams<{ id: string }>();
  const pageNavigate = usePageNavigate();
  const teamProgressDialog = useHubBulkActionDialog<TeamRolePair>();

  const { data, error, refresh } = useGet<HubItemsResponse<HubNamespace>>(
    hubAPI`/_ui/v1/namespaces/?limit=1&name=${params.id}`
  );

  let namespace: HubNamespace | undefined = undefined;
  if (data?.data && data.data.length > 0) {
    namespace = data.data[0];
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
            'Select the team(s) that you want to give access to {{namespaceName}}.',
            {
              namespaceName: namespace?.name,
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
          contentType="namespace"
          fieldNameForPreviousStep="teams"
          descriptionForRoleSelection={t('Choose roles to apply to {{namespaceName}}.', {
            namespaceName: namespace?.name,
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
        title: t('Assign teams'),
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
            content_type: 'galaxy.namespace',
            object_id: namespace?.id,
          }),
        onComplete: () => {
          resolve();
        },
        onClose: () => {
          pageNavigate(HubRoute.NamespaceTeamAccess, {
            params: { id: namespace?.name },
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
          { label: t('Namespaces'), to: getPageUrl(HubRoute.Namespaces) },
          {
            label: namespace?.name,
            to: getPageUrl(HubRoute.NamespaceDetails, { params: { id: namespace?.id } }),
          },
          {
            label: t('Team Access'),
            to: getPageUrl(HubRoute.NamespaceTeamAccess, { params: { id: namespace?.id } }),
          },
          { label: t('Assign teams') },
        ]}
      />
      <PageWizard<WizardFormValues>
        errorAdapter={hubErrorAdapter}
        steps={steps}
        onSubmit={onSubmit}
        disableGrid
        onCancel={() => {
          pageNavigate(HubRoute.NamespaceTeamAccess, { params: { id: namespace?.name } });
        }}
      />
    </PageLayout>
  );
}
