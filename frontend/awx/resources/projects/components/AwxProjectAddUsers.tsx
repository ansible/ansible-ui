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
import { awxAPI } from '../../../common/api/awx-utils';
import { useAwxBulkActionDialog } from '../../../common/useAwxBulkActionDialog';
import { Project } from '../../../interfaces/Project';
import { AwxRoute } from '../../../main/AwxRoutes';
import { gatewayAPI } from '@ansible/platform-ui/utils/gateway-api-utils';
import { PlatformSelectUsersStep } from '@ansible/platform-ui/access/organizations/roles-wizard-steps/PlatformSelectUsersStep';
import { PlatformUser } from '@ansible/platform-ui/interfaces/PlatformUser';
import { PlatformRole } from '@ansible/platform-ui/interfaces/PlatformRole';
import { PlatformRbacRole } from '@ansible/platform-ui/interfaces/PlatformRbacRole';

interface WizardFormValues {
  users: PlatformUser[];
  platformRoles: PlatformRbacRole[];
}

interface UserRolePair {
  user: PlatformUser;
  role: PlatformRole;
}

export function AwxProjectAddUsers() {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const params = useParams<{ id: string }>();

  const { data: project, isLoading } = useGet<Project>(awxAPI`/projects/${params.id ?? ''}/`);
  const userProgressDialog = useAwxBulkActionDialog<UserRolePair>();
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
          contentType="awx.project"
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
            content_type: 'awx.project',
            object_id: project.id,
          }),
        onComplete: () => {
          resolve();
        },
        onClose: () => {
          pageNavigate(AwxRoute.ProjectUsers, {
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
          { label: t('Projects'), to: getPageUrl(AwxRoute.Projects) },
          {
            label: project?.name,
            to: getPageUrl(AwxRoute.ProjectDetails, { params: { id: project?.id } }),
          },
          {
            label: t('User Access '),
            to: getPageUrl(AwxRoute.ProjectUsers, { params: { id: project?.id } }),
          },
          { label: t('Assign users') },
        ]}
      />
      <PageWizard<WizardFormValues>
        steps={steps}
        onSubmit={onSubmit}
        disableGrid
        onCancel={() => {
          pageNavigate(AwxRoute.ProjectUsers, { params: { id: project?.id } });
        }}
      />
    </PageLayout>
  );
}
