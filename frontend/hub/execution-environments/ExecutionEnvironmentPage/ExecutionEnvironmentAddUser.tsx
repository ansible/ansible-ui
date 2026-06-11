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
import { PlatformUser } from '@ansible/platform-ui/interfaces/PlatformUser';
import { gatewayAPI } from '@ansible/platform-ui/utils/gateway-api-utils';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { hubErrorAdapter } from '../../common/adapters/hubErrorAdapter';
import { hubAPI } from '../../common/api/formatPath';
import { HubError } from '../../common/HubError';
import { useHubBulkActionDialog } from '../../common/useHubBulkActionDialog';
import { HubRoute } from '../../main/HubRoutes';
import { ExecutionEnvironment } from '../ExecutionEnvironment';

interface WizardFormValues {
  users: PlatformUser[];
  platformRoles: PlatformRbacRole[];
}

interface UserRolePair {
  user: PlatformUser;
  role: PlatformRbacRole;
}

export function ExecutionEnvironmentAddUsers() {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const params = useParams<{ id: string }>();

  const { data, error, refresh } = useGet<Partial<ExecutionEnvironment>>(
    hubAPI`/v3/plugin/execution-environments/repositories/${params.id ?? ''}/`
  );

  let executionEnvironment: Partial<ExecutionEnvironment> | undefined = undefined;
  if (data && Object.keys(data).length > 0) {
    executionEnvironment = data;
  }

  const userProgressDialog = useHubBulkActionDialog<UserRolePair>();
  const pageNavigate = usePageNavigate();

  if (!data && !error) {
    return <LoadingPage />;
  }

  if (error) {
    return <HubError error={error} handleRefresh={refresh} />;
  }

  const steps: PageWizardStep[] = [
    {
      id: 'users',
      label: t('Select user(s)'),
      inputs: (
        <PlatformSelectUsersStep
          descriptionForUsersSelection={t(
            'Select the user(s) that you want to give access to {{executionEnvironment}}.',
            {
              executionEnvironment: executionEnvironment?.name,
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
          contentType="galaxy.containernamespace"
          fieldNameForPreviousStep="users"
          descriptionForRoleSelection={t('Choose roles to apply to {{executionEnvironment}}.', {
            executionEnvironment: executionEnvironment?.name,
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
            content_type: 'galaxy.containernamespace',
            object_id: executionEnvironment?.namespace?.id,
          }),
        onComplete: () => {
          resolve();
        },
        onClose: () => {
          pageNavigate(HubRoute.ExecutionEnvironmentUserAccess, {
            params: { id: executionEnvironment?.name },
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
          { label: t('Execution environments'), to: getPageUrl(HubRoute.ExecutionEnvironments) },
          {
            label: executionEnvironment?.name,
            to: getPageUrl(HubRoute.ExecutionEnvironmentDetails, {
              params: { id: executionEnvironment?.name },
            }),
          },
          {
            label: t('User Access'),
            to: getPageUrl(HubRoute.ExecutionEnvironmentUserAccess, {
              params: { id: executionEnvironment?.name },
            }),
          },
          { label: t('Assign users') },
        ]}
      />
      <PageWizard<WizardFormValues>
        errorAdapter={hubErrorAdapter}
        steps={steps}
        onSubmit={onSubmit}
        disableGrid
        onCancel={() => {
          pageNavigate(HubRoute.ExecutionEnvironmentUserAccess, {
            params: { id: executionEnvironment?.name },
          });
        }}
      />
    </PageLayout>
  );
}
