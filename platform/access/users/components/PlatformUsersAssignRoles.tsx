import {
  LoadingPage,
  PageHeader,
  PageLayout,
  PageWizard,
  PageWizardStep,
  useGetPageUrl,
  usePageNavigate,
} from '@ansible/ansible-ui-framework';
import { AwxResourceType } from '@ansible/awx-ui/access/common/AwxRolesWizardSteps/AwxSelectResourcesStep';
import { useAwxBulkActionDialog } from '@ansible/awx-ui/common/useAwxBulkActionDialog';
import { RoleAssignmentsReviewStep } from '@ansible/common-ui/access/RolesWizard/steps/RoleAssignmentsReviewStep';
import { postRequest } from '@ansible/common-ui/crud/Data';
import { useGet } from '@ansible/common-ui/crud/useGet';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { PlatformRole } from '../../../interfaces/PlatformRole';
import { PlatformUser } from '../../../interfaces/PlatformUser';
import { PlatformRoute } from '../../../main/PlatformRoutes';
import { gatewayAPI } from '../../../utils/gateway-api-utils';
import { PlatformSelectResourceTypeStep } from '../../common/roles-wizard/PlatformSelectResourceTypeStep';
import { PlatformSelectResourcesStep } from '../../common/roles-wizard/PlatformSelectResourcesStep';
import { PlatformSelectRolesStep } from '../../common/roles-wizard/PlatformSelectRolesStep';
import { objectIdForResource } from '../../teams/components/PlatformTeamAssignRoles';
interface WizardFormValues {
  resourceType: string;
  resources: { id: string; name: string }[];
  platformRoles: PlatformRole[];
}

interface ResourceRolePair {
  resource: { id: string; name: string; pulp_href?: string };
  role: PlatformRole;
}

export function PlatformUsersAssignRoles(props: { id?: string; userRolesRoute?: string }) {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const getPageUrl = useGetPageUrl();
  const pageNavigate = usePageNavigate();
  const progressDialog = useAwxBulkActionDialog<ResourceRolePair>();
  const { data: user, isLoading } = useGet<PlatformUser>(
    gatewayAPI`/users/${props.id || params.id || ''}/`
  );

  if (isLoading || !user) return <LoadingPage />;

  const steps: PageWizardStep[] = [
    {
      id: 'resource-type',
      label: t('Select a resource type'),
      inputs: <PlatformSelectResourceTypeStep />,
    },
    {
      id: 'resources',
      label: t('Select resources'),
      inputs: <PlatformSelectResourcesStep userOrTeamName={user.username} />,
      validate: (formData, _) => {
        const { resources } = formData as { resources: AwxResourceType[] };
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
        pageNavigate(PlatformRoute.UserRoles, { params: { id: params.id } });
      });
    }

    return new Promise<void>((resolve) => {
      progressDialog({
        title: t('Assign roles'),
        description: t('Assigning roles to user {{userName}}.', { userName: user.username }),
        keyFn: ({ resource, role }) => `${resource.id}_${role.id}`,
        items,
        actionColumns: [
          { header: t('Resource name'), cell: ({ resource }) => resource.name },
          { header: t('Role'), cell: ({ role }) => role.name },
        ],
        actionFn: ({ resource, role }, signal) => {
          const requestData = {
            user: user.id,
            role_definition: role.id,
            object_id: objectIdForResource(resourceType, resource),
            content_type: resourceType,
          };
          return postRequest(gatewayAPI`/role_user_assignments/`, requestData, signal);
        },
        onComplete: () => {
          resolve();
        },
        onClose: () => {
          pageNavigate(PlatformRoute.UserRoles, { params: { id: params.id } });
        },
      });
    });
  };

  return (
    <PageLayout>
      <PageHeader
        title={t('Assign roles')}
        breadcrumbs={[
          { label: t('Users'), to: getPageUrl(PlatformRoute.Users) },
          {
            label: user?.username,
            to: getPageUrl(PlatformRoute.UserDetails, { params: { id: user?.id } }),
          },
          {
            label: t('Roles'),
            to: getPageUrl(PlatformRoute.UserRoles, { params: { id: user?.id } }),
          },
          { label: t('Assign roles') },
        ]}
      />
      <PageWizard<WizardFormValues>
        steps={steps}
        onSubmit={onSubmit}
        onCancel={() => {
          pageNavigate(props.userRolesRoute || PlatformRoute.UserRoles, {
            params: { id: params.id },
          });
        }}
        disableGrid
      />
    </PageLayout>
  );
}
