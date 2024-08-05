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
} from '../../../../framework';
import { RoleAssignmentsReviewStep } from '../../../common/access/RolesWizard/steps/RoleAssignmentsReviewStep';
import { postRequest } from '../../../common/crud/Data';
import { useGet } from '../../../common/crud/useGet';
import { HubSelectRolesStep } from '../../access/common/HubRoleWizardSteps/HubSelectRolesStep';
import { HubSelectUsersStep } from '../../access/common/HubRoleWizardSteps/HubSelectUsersStep';
import { hubErrorAdapter } from '../../common/adapters/hubErrorAdapter';
import { hubAPI } from '../../common/api/formatPath';
import { HubError } from '../../common/HubError';
import { useHubBulkActionDialog } from '../../common/useHubBulkActionDialog';
import { HubRbacRole } from '../../interfaces/expanded/HubRbacRole';
import { HubUser } from '../../interfaces/expanded/HubUser';
import { HubRoute } from '../../main/HubRoutes';
import { ExecutionEnvironment } from '../ExecutionEnvironment';

interface WizardFormValues {
  users: HubUser[];
  hubRoles: HubRbacRole[];
}

interface UserRolePair {
  user: HubUser;
  role: HubRbacRole;
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
        <HubSelectUsersStep
          descriptionForUsersSelection={t(
            'Select the user(s) that you want to give access to {{executionEnvironment}}.',
            {
              executionEnvironment: executionEnvironment?.name,
            }
          )}
        />
      ),
      validate: (formData, _) => {
        const { users } = formData as { users: HubUser[] };
        if (!users?.length) {
          throw new Error(t('Select at least one user.'));
        }
      },
    },
    {
      id: 'roles',
      label: t('Select roles to apply'),
      inputs: (
        <HubSelectRolesStep
          contentType="containernamespace"
          fieldNameForPreviousStep="users"
          descriptionForRoleSelection={t('Choose roles to apply to {{executionEnvironment}}.', {
            executionEnvironment: executionEnvironment?.name,
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

  const onSubmit = (data: WizardFormValues) => {
    const { users, hubRoles } = data;
    const items: UserRolePair[] = [];
    for (const user of users) {
      for (const role of hubRoles) {
        items.push({ user, role });
      }
    }
    return new Promise<void>((resolve) => {
      userProgressDialog({
        title: t('Add roles'),
        keyFn: ({ user, role }) => `${user.id}_${role.id}`,
        items,
        actionColumns: [
          { header: t('User'), cell: ({ user }) => user.username },
          { header: t('Role'), cell: ({ role }) => role.name },
        ],
        actionFn: ({ user, role }) =>
          postRequest(hubAPI`/_ui/v2/role_user_assignments/`, {
            user: user.id,
            role_definition: role.id,
            content_type: 'containernamespace',
            object_id: executionEnvironment?.id,
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
        title={t('Add roles')}
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
          { label: t('Add roles') },
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
