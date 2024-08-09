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
import { HubSelectRolesStep } from '../../../access/common/HubRoleWizardSteps/HubSelectRolesStep';
import { HubSelectTeamsStep } from '../../../access/common/HubRoleWizardSteps/HubSelectTeamsStep';
import { hubErrorAdapter } from '../../../common/adapters/hubErrorAdapter';
import { hubAPI, pulpAPI } from '../../../common/api/formatPath';
import { HubError } from '../../../common/HubError';
import { useHubBulkActionDialog } from '../../../common/useHubBulkActionDialog';
import { PulpItemsResponse } from '../../../common/useHubView';
import { HubRbacRole } from '../../../interfaces/expanded/HubRbacRole';
import { HubUserGroup } from '../../../interfaces/expanded/HubUser';
import { HubRoute } from '../../../main/HubRoutes';
import { parsePulpIDFromURL } from '../../../common/api/hub-api-utils';
import { Repository } from '../Repository';

interface WizardFormValues {
  teams: HubUserGroup[]; // Assuming groups will map to team
  hubRoles: HubRbacRole[];
}

interface TeamRolePair {
  team: HubUserGroup;
  role: HubRbacRole;
}

export function RepositoryAddTeams() {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const pageNavigate = usePageNavigate();
  const teamProgressDialog = useHubBulkActionDialog<TeamRolePair>();
  const params = useParams<{ id: string }>();

  const { data, error, refresh } = useGet<PulpItemsResponse<Repository>>(
    params.id ? pulpAPI`/repositories/ansible/ansible/?name=${params.id}` : ''
  );
  let repository: Repository | undefined = undefined;
  if (data && data.results && data.results.length > 0) {
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
        <HubSelectTeamsStep
          descriptionForTeamsSelection={t(
            'Select the team(s) that you want to give access to {{repository}}.',
            {
              repository: repository?.name,
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
          contentType="ansiblerepository"
          fieldNameForPreviousStep="teams"
          descriptionForRoleSelection={t('Choose roles to apply to {{repository}}.', {
            repository: repository?.name,
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
        title={t('Add teams')}
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
          { label: t('Add roles') },
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
