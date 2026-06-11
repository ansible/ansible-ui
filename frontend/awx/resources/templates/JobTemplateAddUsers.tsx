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
import { PlatformSelectRolesStep } from '@ansible/platform-ui/access/organizations/components/PlatformSelectRolesStep';
import { PlatformSelectUsersStep } from '@ansible/platform-ui/access/organizations/roles-wizard-steps/PlatformSelectUsersStep';
import { PlatformRbacRole } from '@ansible/platform-ui/interfaces/PlatformRbacRole';
import { PlatformRole } from '@ansible/platform-ui/interfaces/PlatformRole';
import { PlatformUser } from '@ansible/platform-ui/interfaces/PlatformUser';
import { gatewayAPI } from '@ansible/platform-ui/utils/gateway-api-utils';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { awxAPI } from '../../common/api/awx-utils';
import { useAwxBulkActionDialog } from '../../common/useAwxBulkActionDialog';
import { JobTemplate } from '../../interfaces/JobTemplate';
import { AwxRoute } from '../../main/AwxRoutes';

interface WizardFormValues {
  users: PlatformUser[];
  platformRoles: PlatformRbacRole[];
}

interface UserRolePair {
  user: PlatformUser;
  role: PlatformRole;
}

export function JobTemplateAddUsers() {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const params = useParams<{ id: string }>();

  const { data: template, isLoading } = useGet<JobTemplate>(
    awxAPI`/job_templates/${params.id ?? ''}/`
  );
  const userProgressDialog = useAwxBulkActionDialog<UserRolePair>();
  const pageNavigate = usePageNavigate();

  if (isLoading || !template) return <LoadingPage />;

  const steps: PageWizardStep[] = [
    {
      id: 'users',
      label: t('Select user(s)'),
      inputs: (
        <PlatformSelectUsersStep
          descriptionForUsersSelection={t(
            'Select the user(s) that you want to give access to {{templateName}}.',
            {
              templateName: template?.name,
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
          contentType="awx.jobtemplate"
          fieldNameForPreviousStep="users"
          descriptionForRoleSelection={t('Choose roles to apply to {{templateName}}.', {
            templateName: template?.name,
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
            content_type: 'awx.jobtemplate',
            object_id: template.id,
          }),
        onComplete: () => {
          resolve();
        },
        onClose: () => {
          pageNavigate(AwxRoute.JobTemplateUserAccess, {
            params: { id: template.id.toString() },
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
          { label: t('Templates'), to: getPageUrl(AwxRoute.Templates) },
          {
            label: template?.name,
            to: getPageUrl(AwxRoute.JobTemplateDetails, { params: { id: template?.id } }),
          },
          {
            label: t('User Access'),
            to: getPageUrl(AwxRoute.JobTemplateUserAccess, { params: { id: template?.id } }),
          },
          { label: t('Assign users') },
        ]}
      />
      <PageWizard<WizardFormValues>
        steps={steps}
        onSubmit={onSubmit}
        disableGrid
        onCancel={() => {
          pageNavigate(AwxRoute.JobTemplateUserAccess, { params: { id: template?.id } });
        }}
      />
    </PageLayout>
  );
}
