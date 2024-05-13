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
import { useAwxBulkActionDialog } from '../../../../frontend/awx/common/useAwxBulkActionDialog';
import { gatewayV1API } from '../../../api/gateway-api-utils';
import { useGet } from '../../../../frontend/common/crud/useGet';
import { PlatformOrganization } from '../../../interfaces/PlatformOrganization';
import { PlatformSelectUsersStep } from '../roles-wizard-steps/PlatformSelectUsersStep';
import { PlatformUser } from '../../../interfaces/PlatformUser';
import { AwxSelectRolesStep } from '../../../../frontend/awx/access/common/AwxRolesWizardSteps/AwxSelectRolesStep';
import { AwxRbacRole } from '../../../../frontend/awx/interfaces/AwxRbacRole';
import { EdaSelectRolesStep } from '../../../../frontend/eda/access/common/EdaRolesWizardSteps/EdaSelectRolesStep';
import { EdaRbacRole } from '../../../../frontend/eda/interfaces/EdaRbacRole';
import { RoleAssignmentsReviewStep } from '../../../../frontend/common/access/RolesWizard/steps/RoleAssignmentsReviewStep';
import { postRequest } from '../../../../frontend/common/crud/Data';
import { awxAPI } from '../../../../frontend/awx/common/api/awx-utils';
import { edaAPI } from '../../../../frontend/eda/common/eda-utils';
import { PlatformRoute } from '../../../main/PlatformRoutes';
import { useGatewayService } from '../../../main/GatewayServices';
import { useMemo } from 'react';
import { PlatformRole } from '../../../interfaces/PlatformRole';
import { PlatformItemsResponse } from '../../../interfaces/PlatformItemsResponse';

interface WizardFormValues {
  users: PlatformUser[];
  awxRoles: AwxRbacRole[];
  edaRoles: EdaRbacRole[];
}

interface UserAndAwxRole {
  user: PlatformUser;
  awxRole: AwxRbacRole;
}
interface UserAndEdaRole {
  user: PlatformUser;
  edaRole: EdaRbacRole;
}
interface UserAndPlatformRole {
  user: PlatformUser;
  platformOrgMemberRole: PlatformRole;
}

export function PlatformOrganizationAddUsers() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const getPageUrl = useGetPageUrl();
  const pageNavigate = usePageNavigate();
  const progressDialog = useAwxBulkActionDialog<
    UserAndAwxRole | UserAndEdaRole | UserAndPlatformRole
  >();
  const { data: organization, isLoading } = useGet<PlatformOrganization>(
    gatewayV1API`/organizations/${params.id || ''}/`
  );
  const awxService = useGatewayService('controller');
  const edaService = useGatewayService('eda');
  const { data, isLoading: isLoadingOrgMemberRole } = useGet<PlatformItemsResponse<PlatformRole>>(
    gatewayV1API`/role_definitions/`,
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
      // Show a Roles step with substeps for Controller and EDA roles if both Controller and EDA services are enabled
      ...(awxService && edaService
        ? ([
            {
              id: 'roles',
              label: t('Select roles'),
              substeps: [
                {
                  id: 'awxRoles',
                  label: t('Automation Execution'),
                  inputs: (
                    <AwxSelectRolesStep
                      contentType="organization"
                      fieldNameForPreviousStep="users"
                      descriptionForRoleSelection={t(
                        'Select the roles that you want to apply to the selected users.'
                      )}
                      title={t('Select Automation Execution roles')}
                    />
                  ),
                },
                {
                  id: 'edaRoles',
                  label: t('Automation Decisions'),
                  inputs: (
                    <EdaSelectRolesStep
                      contentType="organization"
                      fieldNameForPreviousStep="users"
                      descriptionForRoleSelection={t(
                        'Select the roles that you want to apply to the selected users.'
                      )}
                      title={t('Select Automation Decisions roles')}
                    />
                  ),
                },
              ],
            },
          ] as PageWizardStep[])
        : []),
      ...(awxService && !edaService
        ? ([
            {
              id: 'roles',
              label: t('Select Automation Execution roles'),
              inputs: (
                <AwxSelectRolesStep
                  contentType="organization"
                  fieldNameForPreviousStep="users"
                  descriptionForRoleSelection={t(
                    'Select the roles that you want to apply to the selected users.'
                  )}
                  title={t('Select Automation Execution roles')}
                />
              ),
            },
          ] as PageWizardStep[])
        : []),
      ...(!awxService && edaService
        ? ([
            {
              id: 'roles',
              label: t('Select Automation Decisions roles'),
              inputs: (
                <EdaSelectRolesStep
                  contentType="organization"
                  fieldNameForPreviousStep="users"
                  descriptionForRoleSelection={t(
                    'Select the roles that you want to apply to the selected users.'
                  )}
                  title={t('Select Automation Decisions roles')}
                />
              ),
            },
          ] as PageWizardStep[])
        : []),
      {
        id: 'review',
        label: t('Review'),
        element: (
          <RoleAssignmentsReviewStep
            edaRolesLabel={t('Automation Decisions roles')}
            awxRolesLabel={t('Automation Execution roles')}
          />
        ),
      },
    ],
    [awxService, edaService, t]
  );

  if (isLoading || isLoadingOrgMemberRole || !organization) return <LoadingPage />;

  const onSubmit = (data: WizardFormValues) => {
    const { users, awxRoles, edaRoles } = data;

    const platformUserRolePairs: UserAndPlatformRole[] = [];
    for (const user of users) {
      platformUserRolePairs.push({
        user,
        platformOrgMemberRole: platformOrgMemberRole as PlatformRole,
      });
    }
    const awxUserRolePairs: UserAndAwxRole[] = [];
    if (awxRoles) {
      for (const user of users) {
        for (const awxRole of awxRoles) {
          awxUserRolePairs.push({ user, awxRole });
        }
      }
    }
    const edaUserRolePairs: UserAndEdaRole[] = [];
    if (edaRoles) {
      for (const user of users) {
        for (const edaRole of edaRoles) {
          edaUserRolePairs.push({ user, edaRole });
        }
      }
    }

    const items = [...platformUserRolePairs, ...awxUserRolePairs, ...edaUserRolePairs];

    return new Promise<void>((resolve) => {
      progressDialog({
        title: t('Add roles'),
        keyFn: (item) =>
          (item as UserAndPlatformRole).platformOrgMemberRole
            ? `${item.user.id}_${(item as UserAndPlatformRole).platformOrgMemberRole.id}`
            : (item as UserAndAwxRole).awxRole
              ? `${item.user.id}_${(item as UserAndAwxRole).awxRole.id}`
              : `${item.user.id}_${(item as UserAndEdaRole).edaRole.id}`,
        items,
        actionColumns: [
          { header: t('User'), cell: ({ user }) => user.username },
          {
            header: t('Role'),
            cell: (item) =>
              (item as UserAndPlatformRole).platformOrgMemberRole
                ? (item as UserAndPlatformRole).platformOrgMemberRole.name
                : (item as UserAndAwxRole).awxRole
                  ? (item as UserAndAwxRole).awxRole.name
                  : (item as UserAndEdaRole).edaRole.name,
          },
        ],
        actionFn: (item) => {
          if ((item as UserAndPlatformRole).platformOrgMemberRole) {
            return postRequest(gatewayV1API`/role_user_assignments/`, {
              user_ansible_id: item.user.summary_fields.resource.ansible_id,
              role_definition: (item as UserAndPlatformRole).platformOrgMemberRole.id,
              content_type: 'shared.organization',
              object_ansible_id: organization?.summary_fields?.resource?.ansible_id || '',
            });
          } else if ((item as UserAndAwxRole).awxRole) {
            return postRequest(awxAPI`/role_user_assignments/`, {
              user_ansible_id: item.user.summary_fields.resource.ansible_id,
              role_definition: (item as UserAndAwxRole).awxRole.id,
              content_type: 'shared.organization',
              object_ansible_id: organization?.summary_fields?.resource?.ansible_id || '',
            });
          } else {
            return postRequest(edaAPI`/role_user_assignments/`, {
              user_ansible_id: item.user.summary_fields.resource.ansible_id,
              role_definition: (item as UserAndEdaRole).edaRole.id,
              content_type: 'shared.organization',
              object_ansible_id: organization?.summary_fields?.resource?.ansible_id || '',
            });
          }
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
        title={t('Add roles')}
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
          { label: t('Add roles') },
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
