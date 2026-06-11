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
import { hubErrorAdapter } from '../../../common/adapters/hubErrorAdapter';
import { pulpAPI } from '../../../common/api/formatPath';
import { parsePulpIDFromURL } from '../../../common/api/hub-api-utils';
import { HubError } from '../../../common/HubError';
import { useHubBulkActionDialog } from '../../../common/useHubBulkActionDialog';
import { PulpItemsResponse } from '../../../common/useHubView';
import { HubRoute } from '../../../main/HubRoutes';
import { Repository } from '../Repository';

interface WizardFormValues {
  teams: PlatformTeam[];
  platformRoles: PlatformRbacRole[];
}

interface TeamRolePair {
  team: PlatformTeam;
  role: PlatformRbacRole;
}

export function RepositoryAssignTeams() {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const pageNavigate = usePageNavigate();
  const teamProgressDialog = useHubBulkActionDialog<TeamRolePair>();
  const params = useParams<{ id: string }>();

  const { data, error, refresh } = useGet<PulpItemsResponse<Repository>>(
    params.id ? pulpAPI`/repositories/ansible/ansible/?name=${params.id}` : ''
  );
  let repository: Repository | undefined = undefined;
  if (data?.results && data.results.length > 0) {
    repository = data.results[0];
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
        <PlatformSelectTeamsStep
          descriptionForTeamsSelection={t(
            'Select the team(s) that you want to give access to {{repository}}.',
            {
              repository: repository?.name,
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
          contentType="galaxy.ansiblerepository"
          fieldNameForPreviousStep="teams"
          descriptionForRoleSelection={t('Choose roles to apply to {{repository}}.', {
            repository: repository?.name,
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
      teamProgressDialog({
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
            content_type: 'galaxy.ansiblerepository',
            object_id: parsePulpIDFromURL(repository?.pulp_href),
          }),
        onComplete: () => {
          resolve();
        },
        onClose: () => {
          pageNavigate(HubRoute.RepositoryTeamAccess, {
            params: { id: repository?.name },
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
          { label: t('Repositories'), to: getPageUrl(HubRoute.Repositories) },
          {
            label: repository?.name,
            to: getPageUrl(HubRoute.RepositoryDetails, { params: { id: repository?.name } }),
          },
          {
            label: t('Team Access'),
            to: getPageUrl(HubRoute.RepositoryTeamAccess, { params: { id: repository?.name } }),
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
          pageNavigate(HubRoute.RepositoryTeamAccess, { params: { id: repository?.name } });
        }}
      />
    </PageLayout>
  );
}
