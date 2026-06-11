import {
  LoadingPage,
  PageHeader,
  PageLayout,
  PageWizard,
  PageWizardStep,
  useGetPageUrl,
  usePageNavigate,
} from '@ansible/ansible-ui-framework';
import { useAwxBulkActionDialog } from '@ansible/awx-ui/common/useAwxBulkActionDialog';
import { RoleAssignmentsReviewStep } from '@ansible/common-ui/access/RolesWizard/steps/RoleAssignmentsReviewStep';
import { postRequest } from '@ansible/common-ui/crud/Data';
import { useGet } from '@ansible/common-ui/crud/useGet';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { PlatformItemsResponse } from '../../../interfaces/PlatformItemsResponse';
import { PlatformOrganization } from '../../../interfaces/PlatformOrganization';
import { PlatformRole } from '../../../interfaces/PlatformRole';
import { PlatformUser } from '../../../interfaces/PlatformUser';
import { PlatformRoute } from '../../../main/PlatformRoutes';
import { gatewayAPI } from '../../../utils/gateway-api-utils';
import { PlatformSelectRolesStep } from '../roles-wizard-steps/PlatformSelectRolesStep';
import { PlatformSelectUsersStep } from '../roles-wizard-steps/PlatformSelectUsersStep';

interface WizardFormValues {
  users: PlatformUser[];
  platformRoles: PlatformRole[];
}

interface UserAndPlatformRole {
  user: PlatformUser;
  role: PlatformRole;
}

export function PlatformOrganizationAssignUsers() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const getPageUrl = useGetPageUrl();
  const pageNavigate = usePageNavigate();
  const progressDialog = useAwxBulkActionDialog<UserAndPlatformRole>();
  const { data: organization, isLoading } = useGet<PlatformOrganization>(
    gatewayAPI`/organizations/${params.id || ''}/`
  );
  const { data, isLoading: isLoadingOrgMemberRole } = useGet<PlatformItemsResponse<PlatformRole>>(
    gatewayAPI`/role_definitions/`,
    {
      name: 'Organization Member',
    }
  );
  const platformOrgMemberRole = useMemo(() => data?.results[0], [data?.results]);

  const steps = useMemo<PageWizardStep[]>(
    () => [
      {
        id: 'users',
        label: t('Select user(s)'),
        inputs: <PlatformSelectUsersStep />,
        validate: (formData, _) => {
          const { users } = formData as { users: PlatformUser[] };
          if (!users?.length) {
            throw new Error(t('Select at least one user.'));
          }
        },
      },
      {
        id: 'roles',
        label: t('Select organization roles'),
        inputs: (
          <PlatformSelectRolesStep
            roleType="shared.organization"
            fieldNameForPreviousStep="users"
            descriptionForRoleSelection={t(
              'Select the organization roles that you want to apply to the selected users. These roles will apply to relevant resources within this organization.'
            )}
            title={t('Select organization roles')}
          />
        ),
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
        element: <RoleAssignmentsReviewStep platformRolesLabel={t`Organization roles`} />,
      },
    ],
    [t]
  );

  if (isLoading || isLoadingOrgMemberRole || !organization) return <LoadingPage />;

  const onSubmit = (data: WizardFormValues) => {
    const { users, platformRoles: roles } = data;

    const items: UserAndPlatformRole[] = [];

    if (platformOrgMemberRole) {
      for (const user of users) {
        items.push({
          user,
          role: platformOrgMemberRole,
        });
      }
    }
    if (roles) {
      for (const user of users) {
        for (const role of roles) {
          items.push({ user, role });
        }
      }
    }

    return new Promise<void>((resolve) => {
      progressDialog({
        title: t('Assign users'),
        keyFn: (item) => `${item.user?.id}_${item.role.id}`,
        items,
        actionColumns: [
          { header: t('User'), cell: ({ user }) => user?.username },
          { header: t('Role'), cell: ({ role }) => role.name },
        ],
        actionFn: (item) => {
          return postRequest(gatewayAPI`/role_user_assignments/`, {
            object_id: organization?.id,
            role_definition: item.role.id,
            user: item.user.id,
          });
        },
        onComplete: () => {
          resolve();
        },
        onClose: () => {
          pageNavigate(PlatformRoute.OrganizationUsers, {
            params: { id: organization.id.toString() },
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
          { label: t('Organizations'), to: getPageUrl(PlatformRoute.Organizations) },
          {
            label: organization?.name,
            to: getPageUrl(PlatformRoute.OrganizationDetails, { params: { id: organization?.id } }),
          },
          {
            label: t('Users'),
            to: getPageUrl(PlatformRoute.OrganizationUsers, { params: { id: organization?.id } }),
          },
          { label: t('Assign users') },
        ]}
      />
      <PageWizard<WizardFormValues>
        steps={steps}
        onSubmit={onSubmit}
        onCancel={() => {
          pageNavigate(PlatformRoute.OrganizationUsers, {
            params: { id: organization.id.toString() },
          });
        }}
        disableGrid
      />
    </PageLayout>
  );
}
