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
import { parsePulpIDFromURL } from '@ansible/hub-ui/common/api/hub-api-utils';

interface WizardFormValues {
  resourceType: string;
  resources: { id: string; name: string }[];
  platformRoles: PlatformRole[];
}

interface ResourceRolePair {
  resource: { id: string; name: string; pulp_href?: string };
  role: PlatformRole;
}

export function objectIdForResource(
  resourceType: string,
  resource: { id: string; name: string; namespace?: { id?: string }; pulp_href?: string }
) {
  switch (resourceType) {
    case 'galaxy.containernamespace':
      return resource?.namespace?.id;
    case 'galaxy.collectionremote':
    case 'galaxy.ansiblerepository':
      return parsePulpIDFromURL(resource?.pulp_href);
    default:
      return resource.id;
  }
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
      inputs: <PlatformSelectResourcesStep userOrTeamName={team.name} />,
      hidden: (wizardData: object) => (wizardData as WizardFormValues).resourceType === 'system',
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
    const isSystemRole = resourceType === 'system';

    if (isSystemRole) {
      for (const role of platformRoles) {
        items.push({ resource: { id: '', name: '' }, role });
      }
    } else {
      for (const resource of resources) {
        for (const role of platformRoles) {
          items.push({ resource, role });
        }
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
          ...(isSystemRole
            ? []
            : [
                {
                  header: t('Resource name'),
                  cell: ({ resource }: ResourceRolePair) => resource.name,
                },
              ]),
          { header: t('Role'), cell: ({ role }: ResourceRolePair) => role.name },
        ],
        actionFn: ({ resource, role }, signal) => {
          const requestData: Record<string, unknown> = {
            team: team.id,
            role_definition: role.id,
          };
          if (!isSystemRole) {
            requestData.object_id = objectIdForResource(resourceType, resource);
          }
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
