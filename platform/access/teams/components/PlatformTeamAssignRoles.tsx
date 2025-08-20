import {
  LoadingPage,
  PageHeader,
  PageLayout,
  PageWizard,
  PageWizardStep,
  useBulkActionDialog,
  useGetPageUrl,
  usePageNavigate,
} from '@ansible/ansible-ui-framework';
import { RoleAssignmentsReviewStep } from '@ansible/common-ui/access/RolesWizard/steps/RoleAssignmentsReviewStep';
import { postRequest } from '@ansible/common-ui/crud/Data';
import { useGet } from '@ansible/common-ui/crud/useGet';
import { PlatformRole } from '@ansible/platform-ui/interfaces/PlatformRole';
import { PlatformTeam } from '@ansible/platform-ui/interfaces/PlatformTeam';
import { PlatformRoute } from '@ansible/platform-ui/main/PlatformRoutes';
import { gatewayAPI } from '@ansible/platform-ui/utils/gateway-api-utils';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { PlatformSelectResourcesStep } from '../../common/roles-wizard/PlatformSelectResourcesStep';
import { PlatformSelectResourceTypeStep } from '../../common/roles-wizard/PlatformSelectResourceTypeStep';
import { PlatformSelectRolesStep } from '../../common/roles-wizard/PlatformSelectRolesStep';

interface WizardFormValues {
  resourceType: string;
  resources: { id: string; name: string }[];
  platformRoles: PlatformRole[];
}

interface ResourceRolePair {
  resource: { id: string; name: string };
  role: PlatformRole;
}
export function PlatformTeamAssignRoles() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const getPageUrl = useGetPageUrl();
  const pageNavigate = usePageNavigate();
  const { data: team, isLoading } = useGet<PlatformTeam>(gatewayAPI`/teams/${params.id || ''}/`);
  const progressDialog = useBulkActionDialog<ResourceRolePair>();

  if (isLoading || !team) return <LoadingPage />;

  const steps: PageWizardStep[] = [
    {
      id: 'resource-type',
      label: t('Select a resource type'),
      inputs: <PlatformSelectResourceTypeStep />,
    },
    {
      id: 'resources',
      label: t('Select resources'),
      inputs: <PlatformSelectResourcesStep />,
      validate: (formData, _) => {
        const { resources } = formData as { resources: { id: string; name: string }[] };
        if (!resources?.length) {
          throw new Error(t('Select at least one resource.'));
        }
      },
    },
    {
      id: 'roles',
      label: t('Select roles to apply'),
      inputs: <PlatformSelectRolesStep />,
      validate: (formData, _) => {
        const { platformRoles } = formData as { platformRoles: PlatformRole[] };
        if (!platformRoles?.length) {
          throw new Error(t('Select at least one role.'));
        }
      },
    },
    {
      id: 'review',
      label: t('Review'),
      element: <RoleAssignmentsReviewStep platformRolesLabel={t('Platform roles')} />,
    },
  ];

  const onSubmit = (data: WizardFormValues): Promise<void> => {
    const { resources, platformRoles, resourceType } = data;
    const items: ResourceRolePair[] = [];

    for (const resource of resources) {
      for (const role of platformRoles) {
        items.push({ resource, role });
      }
    }

    if (!items.length) {
      return new Promise<void>((resolve) => {
        resolve();
        pageNavigate(PlatformRoute.TeamRoles, { params: { id: params.id } });
      });
    }

    return new Promise<void>((resolve) => {
      progressDialog({
        title: t('Assign roles'),
        description: t('Assigning roles to team {{teamName}}.', { teamName: team.name }),
        keyFn: ({ resource, role }) => `${resource.id}_${role.id}`,
        items,
        actionColumns: [
          { header: t('Resource name'), cell: ({ resource }) => resource.name },
          { header: t('Role'), cell: ({ role }) => role.name },
        ],
        actionFn: ({ resource, role }, signal) => {
          const requestData = {
            team: team.id,
            role_definition: role.id,
            object_id: resource.id,
            content_type: resourceType,
          };
          return postRequest(gatewayAPI`/role_team_assignments/`, requestData, signal);
        },
        onComplete: () => {
          resolve();
        },
        onClose: () => {
          pageNavigate(PlatformRoute.TeamRoles, { params: { id: params.id } });
        },
      });
    });
  };

  return (
    <PageLayout>
      <PageHeader
        title={t('Assign roles')}
        breadcrumbs={[
          { label: t('Teams'), to: getPageUrl(PlatformRoute.Teams) },
          {
            label: team.name,
            to: getPageUrl(PlatformRoute.TeamDetails, { params: { id: team.id } }),
          },
          {
            label: t('Roles'),
            to: getPageUrl(PlatformRoute.TeamRoles, { params: { id: team.id } }),
          },
          { label: t('Assign roles') },
        ]}
      />
      <PageWizard<WizardFormValues>
        steps={steps}
        onSubmit={onSubmit}
        onCancel={() => {
          pageNavigate(PlatformRoute.TeamRoles, { params: { id: params.id } });
        }}
        disableGrid
      />
    </PageLayout>
  );
}
