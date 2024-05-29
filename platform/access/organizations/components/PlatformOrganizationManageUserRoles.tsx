import { Trans, useTranslation } from 'react-i18next';
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
import { PlatformUser } from '../../../interfaces/PlatformUser';
import { AwxSelectRolesStep } from '../../../../frontend/awx/access/common/AwxRolesWizardSteps/AwxSelectRolesStep';
import { AwxRbacRole } from '../../../../frontend/awx/interfaces/AwxRbacRole';
import { EdaSelectRolesStep } from '../../../../frontend/eda/access/common/EdaRolesWizardSteps/EdaSelectRolesStep';
import { EdaRbacRole } from '../../../../frontend/eda/interfaces/EdaRbacRole';
import { RoleAssignmentsReviewStep } from '../../../../frontend/common/access/RolesWizard/steps/RoleAssignmentsReviewStep';
import { postRequest, requestDelete } from '../../../../frontend/common/crud/Data';
import { awxAPI } from '../../../../frontend/awx/common/api/awx-utils';
import { edaAPI } from '../../../../frontend/eda/common/eda-utils';
import { PlatformRoute } from '../../../main/PlatformRoutes';
import { useGatewayService } from '../../../main/GatewayServices';
import { useCallback, useMemo } from 'react';
import { useGetAwxOrganizationRolesForUser } from '../hooks/useGetAwxOrganizationRolesForUser';
import { useGetEdaOrganizationRolesForUser } from '../hooks/useGetEdaOrganizationRolesForUser';
import { getAddedAndRemovedRoles } from '../utils/getAddedAndRemovedRoles';

interface RemoveRole {
  remove?: boolean;
  roleAssignmentId?: number;
}

interface WizardFormValues {
  users: PlatformUser[];
  awxRoles: (AwxRbacRole & RemoveRole)[];
  edaRoles: (EdaRbacRole & RemoveRole)[];
}

interface UserAndAwxRole {
  user: PlatformUser;
  awxRole: AwxRbacRole & RemoveRole;
}

interface UserAndEdaRole {
  user: PlatformUser;
  edaRole: EdaRbacRole & RemoveRole;
}

type UserAndRolePair = UserAndAwxRole | UserAndEdaRole;

export function PlatformOrganizationManageUserRoles() {
  const { t } = useTranslation();
  const params = useParams<{ id: string; userId: string }>();
  const getPageUrl = useGetPageUrl();
  const pageNavigate = usePageNavigate();
  const progressDialog = useAwxBulkActionDialog<UserAndRolePair>();
  // Platform Organization
  const { data: organization, isLoading: isLoadingOrg } = useGet<PlatformOrganization>(
    gatewayV1API`/organizations/${params.id || ''}/`
  );
  // Platform User
  const { data: user, isLoading: isLoadingUser } = useGet<PlatformUser>(
    gatewayV1API`/users/${params.userId || ''}/`
  );

  // Existing selection of roles for the user based on role user assignments
  const { selectedRoles: selectedAwxRoles, isLoading: isLoadingSelectedAwxRoles } =
    useGetAwxOrganizationRolesForUser(organization, user);
  const { selectedRoles: selectedEdaRoles, isLoading: isLoadingSelectedEdaRoles } =
    useGetEdaOrganizationRolesForUser(organization, user);

  // Set default selections in the wizard
  const defaultValue = useMemo(
    () => ({
      awxRoles: selectedAwxRoles ? selectedAwxRoles : [],
      edaRoles: selectedEdaRoles ? selectedEdaRoles : [],
    }),
    [selectedAwxRoles, selectedEdaRoles]
  );

  const awxService = useGatewayService('controller');
  const edaService = useGatewayService('eda');

  const steps = useMemo<PageWizardStep[]>(
    () => [
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
                      descriptionForRoleSelection={t(
                        'Select the roles that you want to apply to {{username}}.',
                        { username: user?.username }
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
                      descriptionForRoleSelection={t(
                        'Select the roles that you want to apply to {{username}}.',
                        { username: user?.username }
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
                  descriptionForRoleSelection={t(
                    'Select the roles that you want to apply to {{username}}.',
                    { username: user?.username }
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
                  descriptionForRoleSelection={t(
                    'Select the roles that you want to apply to {{username}}.',
                    { username: user?.username }
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
            selectedUser={user}
          />
        ),
      },
    ],
    [awxService, edaService, t, user]
  );

  const progressDialogActionFunction = useCallback(
    (item: UserAndRolePair, signal: AbortSignal) => {
      if ((item as UserAndAwxRole).awxRole) {
        if ((item as UserAndAwxRole).awxRole.remove) {
          return requestDelete(
            awxAPI`/role_user_assignments/` +
              `${(item as UserAndAwxRole).awxRole.roleAssignmentId?.toString()}/`,
            signal
          );
        } else {
          return postRequest(
            awxAPI`/role_user_assignments/`,
            {
              user_ansible_id: item.user.summary_fields.resource.ansible_id,
              role_definition: (item as UserAndAwxRole).awxRole.id,
              content_type: 'shared.organization',
              object_ansible_id: organization?.summary_fields?.resource?.ansible_id || '',
            },
            signal
          );
        }
      } else {
        if ((item as UserAndEdaRole).edaRole.remove) {
          return requestDelete(
            edaAPI`/role_user_assignments/` +
              `${(item as UserAndEdaRole).edaRole.roleAssignmentId?.toString()}/`,
            signal
          );
        } else {
          return postRequest(
            edaAPI`/role_user_assignments/`,
            {
              user_ansible_id: item.user.summary_fields.resource.ansible_id,
              role_definition: (item as UserAndEdaRole).edaRole.id,
              content_type: 'shared.organization',
              object_ansible_id: organization?.summary_fields?.resource?.ansible_id || '',
            },
            signal
          );
        }
      }
    },
    [organization?.summary_fields?.resource?.ansible_id]
  );

  if (
    isLoadingOrg ||
    isLoadingUser ||
    !organization ||
    !user ||
    isLoadingSelectedAwxRoles ||
    isLoadingSelectedEdaRoles
  ) {
    return <LoadingPage />;
  }

  const onSubmit = (data: WizardFormValues) => {
    const { awxRoles: updatedAwxRoles, edaRoles: updatedEdaRoles } = data;
    const awxRolesData: (AwxRbacRole & { remove?: boolean })[] = [];
    const edaRolesData: (EdaRbacRole & { remove?: boolean })[] = [];

    if (selectedAwxRoles?.length || selectedEdaRoles?.length) {
      const awxRoles = getAddedAndRemovedRoles(
        selectedAwxRoles as (AwxRbacRole & RemoveRole)[],
        updatedAwxRoles
      );
      awxRolesData.push(...(awxRoles as (AwxRbacRole & { remove?: boolean })[]));
      const edaRoles = getAddedAndRemovedRoles(
        selectedEdaRoles as (AwxRbacRole & RemoveRole)[],
        updatedEdaRoles
      );
      edaRolesData.push(...(edaRoles as (EdaRbacRole & { remove?: boolean })[]));
    } else {
      awxRolesData.push(...updatedAwxRoles);
      edaRolesData.push(...updatedEdaRoles);
    }

    const awxUserRolePairs: UserAndAwxRole[] = [];
    if (awxRolesData) {
      for (const awxRole of awxRolesData) {
        awxUserRolePairs.push({ user, awxRole });
      }
    }
    const edaUserRolePairs: UserAndEdaRole[] = [];
    if (edaRolesData) {
      for (const edaRole of edaRolesData) {
        edaUserRolePairs.push({ user, edaRole });
      }
    }
    const items = [...awxUserRolePairs, ...edaUserRolePairs];

    if (!items.length) {
      return new Promise<void>((resolve) => {
        resolve();
        pageNavigate(PlatformRoute.OrganizationUsers, {
          params: { id: organization.id.toString() },
        });
      });
    }

    return new Promise<void>((resolve) => {
      progressDialog({
        title: t('Manage roles'),
        description: (
          <Trans>
            The organization roles listed below for <b>{user.username}</b> have been changed.
          </Trans>
        ),
        keyFn: (item) =>
          (item as UserAndAwxRole).awxRole
            ? `${item.user.id}_${(item as UserAndAwxRole).awxRole.id}`
            : `${item.user.id}_${(item as UserAndEdaRole).edaRole.id}`,
        items,
        actionColumns: [
          {
            header: t('Role'),
            cell: (item) =>
              (item as UserAndAwxRole).awxRole
                ? (item as UserAndAwxRole).awxRole.name
                : (item as UserAndEdaRole).edaRole.name,
          },
          {
            header: t('Assignment type'),
            cell: (item) => {
              if ((item as UserAndAwxRole).awxRole) {
                return (item as UserAndAwxRole).awxRole.remove ? t('Removed') : t('Added');
              } else {
                return (item as UserAndEdaRole).edaRole.remove ? t('Removed') : t('Added');
              }
            },
          },
        ],
        actionFn: progressDialogActionFunction,
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
        title={t('Manage roles for {{username}}', { username: user?.username })}
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
          { label: t('Manage {{username}} roles', { username: user?.username }) },
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
        defaultValue={defaultValue}
        disableGrid
      />
    </PageLayout>
  );
}
