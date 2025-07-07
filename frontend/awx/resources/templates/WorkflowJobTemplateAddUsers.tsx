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
import { AwxSelectRolesStep } from '../../access/common/AwxRolesWizardSteps/AwxSelectRolesStep';
import { AwxSelectUsersStep } from '../../access/common/AwxRolesWizardSteps/AwxSelectUsersStep';
import { awxErrorAdapter } from '../../common/adapters/awxErrorAdapter';
import { awxAPI } from '../../common/api/awx-utils';
import { useAwxBulkActionDialog } from '../../common/useAwxBulkActionDialog';
import { Role } from '../../interfaces/Role';
import { AwxUser } from '../../interfaces/User';
import { WorkflowJobTemplate } from '../../interfaces/WorkflowJobTemplate';
import { AwxRoute } from '../../main/AwxRoutes';

interface WizardFormValues {
  users: AwxUser[];
  awxRoles: Role[];
}

interface UserRolePair {
  user: AwxUser;
  role: Role;
}

export function WorkflowJobTemplateAddUsers() {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const params = useParams<{ id: string }>();

  const { data: template, isLoading } = useGet<WorkflowJobTemplate>(
    awxAPI`/workflow_job_templates/${params.id ?? ''}/`
  );
  const userProgressDialog = useAwxBulkActionDialog<UserRolePair>();
  const pageNavigate = usePageNavigate();

  if (isLoading || !template) return <LoadingPage />;

  const steps: PageWizardStep[] = [
    {
      id: 'users',
      label: t('Select user(s)'),
      inputs: (
        <AwxSelectUsersStep
          descriptionForUsersSelection={t(
            'Select the user(s) that you want to give access to {{templateName}}.',
            {
              templateName: template?.name,
            }
          )}
        />
      ),
      validate: (formData, _) => {
        const { users } = formData as WizardFormValues;
        if (!users?.length) {
          throw new Error(t('Select at least one user.'));
        }
      },
    },
    {
      id: 'roles',
      label: t('Select roles to apply'),
      inputs: (
        <AwxSelectRolesStep
          contentType="workflowjobtemplate"
          fieldNameForPreviousStep="users"
          descriptionForRoleSelection={t('Choose roles to apply to {{templateName}}.', {
            templateName: template?.name,
          })}
        />
      ),
      validate: (formData, _) => {
        const { awxRoles } = formData as WizardFormValues;
        if (!awxRoles?.length) {
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
    const { users, awxRoles } = data;
    const items: UserRolePair[] = [];
    for (const user of users) {
      for (const role of awxRoles) {
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
          postRequest(awxAPI`/role_user_assignments/`, {
            user: user?.id,
            role_definition: role.id,
            content_type: 'workflowjobtemplate',
            object_id: template.id,
          }),
        onComplete: () => {
          resolve();
        },
        onClose: () => {
          pageNavigate(AwxRoute.WorkflowJobTemplateUserAccess, {
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
            to: getPageUrl(AwxRoute.WorkflowJobTemplateDetails, { params: { id: template?.id } }),
          },
          {
            label: t('User Access'),
            to: getPageUrl(AwxRoute.WorkflowJobTemplateUserAccess, {
              params: { id: template?.id },
            }),
          },
          { label: t('Assign users') },
        ]}
      />
      <PageWizard<WizardFormValues>
        steps={steps}
        onSubmit={onSubmit}
        disableGrid
        onCancel={() => {
          pageNavigate(AwxRoute.WorkflowJobTemplateUserAccess, { params: { id: template?.id } });
        }}
        errorAdapter={awxErrorAdapter}
      />
    </PageLayout>
  );
}
