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
import { HubSelectRolesStep } from '../../access/common/HubRoleWizardSteps/HubSelectRolesStep';
import { HubSelectUsersStep } from '../../access/common/HubRoleWizardSteps/HubSelectUsersStep';
import { hubErrorAdapter } from '../../common/adapters/hubErrorAdapter';
import { hubAPI } from '../../common/api/formatPath';
import { HubError } from '../../common/HubError';
import { useHubBulkActionDialog } from '../../common/useHubBulkActionDialog';
import { HubItemsResponse } from '../../common/useHubView';
import { HubRbacRole } from '../../interfaces/expanded/HubRbacRole';
import { HubUser } from '../../interfaces/expanded/HubUser';
import { HubRoute } from '../../main/HubRoutes';
import { HubNamespace } from '../HubNamespace';

interface WizardFormValues {
  users: HubUser[];
  hubRoles: HubRbacRole[];
}

interface UserRolePair {
  user: HubUser;
  role: HubRbacRole;
}

export function HubNamespaceAddUsers() {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const params = useParams<{ id: string }>();

  const { data, error, refresh } = useGet<HubItemsResponse<HubNamespace>>(
    hubAPI`/_ui/v1/namespaces/?limit=1&name=${params.id}`
  );

  let namespace: HubNamespace | undefined = undefined;
  if (data && data.data && data.data.length > 0) {
    namespace = data.data[0];
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
            'Select the user(s) that you want to give access to {{namespaceName}}.',
            {
              namespaceName: namespace?.name,
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
          contentType="namespace"
          fieldNameForPreviousStep="users"
          descriptionForRoleSelection={t('Choose roles to apply to {{namespaceName}}.', {
            namespaceName: namespace?.name,
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
        keyFn: ({ user, role }) => `${user?.id}_${role.id}`,
        items,
        actionColumns: [
          { header: t('User'), cell: ({ user }) => user?.username },
          { header: t('Role'), cell: ({ role }) => role.name },
        ],
        actionFn: ({ user, role }) =>
          postRequest(hubAPI`/_ui/v2/role_user_assignments/`, {
            user: user?.id,
            role_definition: role.id,
            content_type: 'galaxy.namespace',
            object_id: namespace?.id,
          }),
        onComplete: () => {
          resolve();
        },
        onClose: () => {
          pageNavigate(HubRoute.NamespaceUserAccess, {
            params: { id: namespace?.name },
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
          { label: t('Namespaces'), to: getPageUrl(HubRoute.Namespaces) },
          {
            label: namespace?.name,
            to: getPageUrl(HubRoute.NamespaceDetails, { params: { id: namespace?.name } }),
          },
          {
            label: t('User Access'),
            to: getPageUrl(HubRoute.NamespaceUserAccess, { params: { id: namespace?.name } }),
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
          pageNavigate(HubRoute.NamespaceUserAccess, { params: { id: namespace?.name } });
        }}
      />
    </PageLayout>
  );
}
