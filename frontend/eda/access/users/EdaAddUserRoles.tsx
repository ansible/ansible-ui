import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import {
  PageLayout,
  PageHeader,
  PageWizard,
  PageWizardStep,
  usePageNavigate,
  LoadingPage,
  useGetPageUrl,
} from '../../../../framework';
import { useGet } from '../../../common/crud/useGet';
import { edaAPI } from '../../common/eda-utils';
import { EdaRoute } from '../../main/EdaRoutes';
import { EdaSelectResourceTypeStep } from '../common/EdaRolesWizardSteps/EdaSelectResourceTypeStep';
import { EdaUser } from '../../interfaces/EdaUser';
import {
  EdaResourceType,
  EdaSelectResourcesStep,
} from '../common/EdaRolesWizardSteps/EdaSelectResourcesStep';
import { EdaSelectRolesStep } from '../common/EdaRolesWizardSteps/EdaSelectRolesStep';
import { EdaRbacRole } from '../../interfaces/EdaRbacRole';
import { RoleAssignmentsReviewStep } from '../../../common/access/RolesWizard/steps/RoleAssignmentsReviewStep';
import { useEdaBulkActionDialog } from '../../common/useEdaBulkActionDialog';
import { postRequest } from '../../../common/crud/Data';

interface WizardFormValues {
  resourceType: string;
  resources: EdaResourceType[];
  edaRoles: EdaRbacRole[];
}

interface ResourceRolePair {
  resource: EdaResourceType;
  role: EdaRbacRole;
}

export function EdaAddUserRoles() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const getPageUrl = useGetPageUrl();
  const pageNavigate = usePageNavigate();
  const progressDialog = useEdaBulkActionDialog<ResourceRolePair>();
  // Use ansible_id to retrieve user
  const { data: user, isLoading } = useGet<EdaUser>(edaAPI`/users/${params.id ?? ''}/`);

  if (isLoading || !user) return <LoadingPage />;

  const steps: PageWizardStep[] = [
    {
      id: 'resource-type',
      label: t('Select a resource type'),
      inputs: <EdaSelectResourceTypeStep />,
    },
    {
      id: 'resources',
      label: t('Select resources'),
      inputs: <EdaSelectResourcesStep />,
      validate: (formData, _) => {
        const { resources } = formData as { resources: EdaResourceType[] };
        if (!resources?.length) {
          throw new Error(t('Select at least one resource.'));
        }
      },
    },
    {
      id: 'roles',
      label: t('Select roles to apply'),
      inputs: <EdaSelectRolesStep fieldNameForPreviousStep="resources" />,
      validate: (formData, _) => {
        const { edaRoles } = formData as { edaRoles: EdaRbacRole[] };
        if (!edaRoles?.length) {
          throw new Error(t('Select at least one role.'));
        }
      },
    },
    { id: 'review', label: t('Review'), element: <RoleAssignmentsReviewStep /> },
  ];

  const onSubmit = (data: WizardFormValues) => {
    const { resources, edaRoles, resourceType } = data;
    const items: ResourceRolePair[] = [];
    for (const resource of resources) {
      for (const role of edaRoles) {
        items.push({ resource, role });
      }
    }
    return new Promise<void>((resolve) => {
      progressDialog({
        title: t('Add roles'),
        keyFn: ({ resource, role }) => `${resource.id}_${role.id}`,
        items,
        actionColumns: [
          { header: t('Resource name'), cell: ({ resource }) => resource.name },
          { header: t('Role'), cell: ({ role }) => role.name },
        ],
        actionFn: ({ resource, role }) =>
          postRequest(edaAPI`/role_user_assignments/`, {
            user: user.id,
            role_definition: role.id,
            content_type: resourceType,
            object_id: resource.id,
          }),
        onComplete: () => {
          resolve();
        },
        onClose: () => {
          pageNavigate(EdaRoute.UserRoles, {
            params: { id: user.id.toString() },
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
          { label: t('Users'), to: getPageUrl(EdaRoute.Users) },
          {
            label: user?.username,
            to: getPageUrl(EdaRoute.UserDetails, { params: { id: user?.id } }),
          },
          {
            label: t('Roles'),
            to: getPageUrl(EdaRoute.UserRoles, { params: { id: user?.id } }),
          },
          { label: t('Add roles') },
        ]}
      />
      <PageWizard<WizardFormValues>
        steps={steps}
        onSubmit={onSubmit}
        onCancel={() => {
          pageNavigate(EdaRoute.UserRoles, { params: { id: user?.id } });
        }}
        disableGrid
      />
    </PageLayout>
  );
}
