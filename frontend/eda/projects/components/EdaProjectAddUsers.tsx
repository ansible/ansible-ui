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
import { PlatformSelectRolesStep } from '@ansible/platform-ui/access/organizations/components/PlatformSelectRolesStep';
import { edaAPI } from '../../common/eda-utils';
import { edaErrorAdapter } from '../../common/edaErrorAdapter';
import { useEdaBulkActionDialog } from '../../common/useEdaBulkActionDialog';
import { EdaProject } from '../../interfaces/EdaProject';
import { EdaRoute } from '../../main/EdaRoutes';
import { gatewayAPI } from '@ansible/platform-ui/utils/gateway-api-utils';
import { PlatformSelectUsersStep } from '@ansible/platform-ui/access/organizations/roles-wizard-steps/PlatformSelectUsersStep';
import { PlatformUser } from '@ansible/platform-ui/interfaces/PlatformUser';
import { PlatformRbacRole } from '@ansible/platform-ui/interfaces/PlatformRbacRole';

interface WizardFormValues {
  users: PlatformUser[];
  platformRoles: PlatformRbacRole[];
}

interface UserRolePair {
  user: PlatformUser;
  role: PlatformRbacRole;
}

export function EdaProjectAddUsers() {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const params = useParams<{ id: string }>();

  const { data: project, isLoading } = useGet<EdaProject>(edaAPI`/projects/${params.id ?? ''}/`);
  const userProgressDialog = useEdaBulkActionDialog<UserRolePair>();
  const pageNavigate = usePageNavigate();

  if (isLoading || !project) return <LoadingPage />;

  const steps: PageWizardStep[] = [
    {
      id: 'users',
      label: t('Select user(s)'),
      inputs: (
        <PlatformSelectUsersStep
          descriptionForUsersSelection={t(
            'Select the user(s) that you want to give access to {{projectName}}.',
            {
              projectName: project?.name,
            }
          )}
        />
      ),
      validate: (formData, _) => {
        const { users } = formData as { users: PlatformUser[] };
        if (!users?.length) {
          throw new Error(t('Select at least one user.'));
        }
      },
    },
    {
      id: 'platformRoles',
      label: t('Select roles to apply'),
      inputs: (
        <PlatformSelectRolesStep
          contentType="eda.project"
          fieldNameForPreviousStep="users"
          descriptionForRoleSelection={t('Choose roles to apply to {{projectName}}.', {
            projectName: project?.name,
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

  const onSubmit = (data: WizardFormValues) => {
    const { users, platformRoles } = data;
    const items: UserRolePair[] = [];
    for (const user of users) {
      for (const role of platformRoles) {
        items.push({ user, role });
      }
    }
    return new Promise<void>((resolve) => {
      userProgressDialog({
        title: t('Assign users'),
        keyFn: ({ user, role }) => `${user?.id}_${role.id}`,
        items,
        actionColumns: [
          { header: t('User'), cell: ({ user }) => user?.username },
          { header: t('Role'), cell: ({ role }) => role.name },
        ],
        actionFn: ({ user, role }) =>
          postRequest(gatewayAPI`/role_user_assignments/`, {
            user: user?.id,
            role_definition: role.id,
            content_type: 'eda.project',
            object_id: project.id,
          }),
        onComplete: () => {
          resolve();
        },
        onClose: () => {
          pageNavigate(EdaRoute.ProjectUserAccess, {
            params: { id: project.id.toString() },
          });
        },
      });
    });
  };

  return (
    <PageLayout>
      <PageHeader
        title={t('Assign users')}
        breadcrumbs={[
          { label: t('Projects'), to: getPageUrl(EdaRoute.Projects) },
          {
            label: project?.name,
            to: getPageUrl(EdaRoute.ProjectDetails, { params: { id: project?.id } }),
          },
          {
            label: t('User Access'),
            to: getPageUrl(EdaRoute.ProjectUserAccess, { params: { id: project?.id } }),
          },
          { label: t('Assign users') },
        ]}
      />
      <PageWizard<WizardFormValues>
        errorAdapter={edaErrorAdapter}
        steps={steps}
        onSubmit={onSubmit}
        disableGrid
        onCancel={() => {
          pageNavigate(EdaRoute.ProjectUserAccess, { params: { id: project?.id } });
        }}
      />
    </PageLayout>
  );
}
