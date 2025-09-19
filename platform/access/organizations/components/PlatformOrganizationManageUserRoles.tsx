import {
  LoadingPage,
  PageForm,
  PageHeader,
  PageLayout,
  useBulkActionDialog,
  useGetPageUrl,
  usePageNavigate,
} from '@ansible/ansible-ui-framework';
import { PageMultiSelectList } from '@ansible/ansible-ui-framework/PageTable/PageMultiSelectList';
import { postRequest, requestDelete } from '@ansible/common-ui/crud/Data';
import { useGet } from '@ansible/common-ui/crud/useGet';
import { PlatformRbacRole } from '@ansible/platform-ui/interfaces/PlatformRbacRole';
import { Content, ContentVariants } from '@patternfly/react-core';
import { useCallback, useEffect } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { usePlatformView } from '../../../hooks/usePlatformView';
import { PlatformOrganization } from '../../../interfaces/PlatformOrganization';
import { PlatformUser } from '../../../interfaces/PlatformUser';
import { PlatformRoute } from '../../../main/PlatformRoutes';
import { gatewayAPI } from '../../../utils/gateway-api-utils';
import { usePlatformRoleColumns } from '../../roles/hooks/usePlatformRoleColumns';
import { usePlatformRolesFilters } from '../../roles/hooks/usePlatformRolesFilters';
import { useGetOrganizationRolesForUser } from '../hooks/useGetOrganizationRolesForUser';
import { getAddedAndRemovedPlatformRoles } from '../utils/getAddedAndRemovedPlatformRoles';
import { ResourceUserIndirectRolesPanel } from '@ansible/common-ui/access/indirect-roles/components/ResourceUserIndirectRolesPanel';

interface RemoveRole {
  remove?: boolean;
  roleAssignmentId?: number;
}

export interface WizardFormValues {
  users: PlatformUser[];
  platformRoles: (PlatformRbacRole & RemoveRole)[];
}

interface UserAndPlatformRole {
  user: PlatformUser;
  platformRole: PlatformRbacRole & RemoveRole;
}

export function PlatformOrganizationManageUserRoles() {
  const { t } = useTranslation();
  const params = useParams<{ id: string; userId: string }>();
  const getPageUrl = useGetPageUrl();
  const pageNavigate = usePageNavigate();
  const progressDialog = useBulkActionDialog<UserAndPlatformRole>();
  const { data: organization, isLoading: isLoadingOrg } = useGet<PlatformOrganization>(
    gatewayAPI`/organizations/${params.id || ''}/`
  );
  const { data: user, isLoading: isLoadingUser } = useGet<PlatformUser>(
    gatewayAPI`/users/${params.userId || ''}/`
  );

  // Existing selection of roles for the user based on role user assignments
  const { selectedRoles: initialRoles, isLoading: isInitialRolesLoading } =
    useGetOrganizationRolesForUser(organization, user);
  const defaultValue = {
    platformRoles: initialRoles ?? [],
  };

  const toolbarFilters = usePlatformRolesFilters();
  const tableColumns = usePlatformRoleColumns({ disableExtraColumns: true, disableLinks: true });
  const view = usePlatformView<PlatformRbacRole>({
    url: gatewayAPI`/role_definitions/`,
    queryParams: {
      content_type__api_slug: 'shared.organization',
    },
    toolbarFilters,
    tableColumns,
    disableQueryString: true,
    defaultSelection: initialRoles,
  });

  // If the user saves then immediately re-enters the manage
  // roles form, the old assignments are sometimes still cached
  // in swr. This ensures the updated values show in the form
  // when that occurs.
  useEffect(() => {
    view.unselectAll();
    view.selectItems(initialRoles);
  }, [initialRoles]); // eslint-disable-line react-hooks/exhaustive-deps

  const progressDialogActionFunction = useCallback(
    (item: UserAndPlatformRole, signal: AbortSignal): Promise<unknown> | undefined => {
      if (!item.platformRole) {
        return;
      }

      if (item.platformRole.remove) {
        return requestDelete(
          gatewayAPI`/role_user_assignments/` +
            `${item.platformRole.roleAssignmentId?.toString()}/`,
          signal
        );
      }
      return postRequest(
        gatewayAPI`/role_user_assignments/`,
        {
          user: user?.id,
          role_definition: item.platformRole.id,
          content_type: 'shared.organization',
          object_id: organization?.id || '',
        },
        signal
      );
    },
    [organization, user?.id]
  );

  if (isLoadingOrg || isLoadingUser || isInitialRolesLoading || !organization || !user) {
    return <LoadingPage />;
  }

  const onSubmit = () => {
    const updatedRoles = view.selectedItems as (PlatformRbacRole & RemoveRole)[];
    const platformRolesData: (PlatformRbacRole & { remove?: boolean })[] = [];

    if (initialRoles?.length) {
      const platformRoles = getAddedAndRemovedPlatformRoles(
        initialRoles as (PlatformRbacRole & RemoveRole)[],
        updatedRoles
      );
      platformRolesData.push(...(platformRoles as (PlatformRbacRole & { remove?: boolean })[]));
    } else {
      platformRolesData.push(...updatedRoles);
    }

    const platformUserRolePairs: UserAndPlatformRole[] = [];
    if (platformRolesData) {
      for (const platformRole of platformRolesData) {
        platformUserRolePairs.push({ user, platformRole });
      }
    }
    const items = platformUserRolePairs;

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
            The organization roles listed below for <b>{user?.username}</b> have been changed.
          </Trans>
        ),
        keyFn: (item) => item.platformRole.id,
        items,
        actionColumns: [
          {
            header: t('Role'),
            cell: (item) => item.platformRole.name,
          },
          {
            header: t('Assignment type'),
            cell: (item) => {
              if (item.platformRole) {
                return item.platformRole.remove ? t('Removed') : t('Added');
              }
            },
          },
        ],
        actionFn: progressDialogActionFunction as (
          item: UserAndPlatformRole,
          signal: AbortSignal
        ) => Promise<unknown>,
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
        title={t('Manage organization roles directly assigned to {{username}}', {
          username: user.username,
        })}
        breadcrumbs={[
          { label: t('Organizations'), to: getPageUrl(PlatformRoute.Organizations) },
          {
            label: organization.name,
            to: getPageUrl(PlatformRoute.OrganizationDetails, { params: { id: organization.id } }),
          },
          {
            label: t('Users'),
            to: getPageUrl(PlatformRoute.OrganizationUsers, { params: { id: organization.id } }),
          },
          {
            label: t('Manage organization roles directly assigned to {{username}}', {
              username: user.username,
            }),
          },
        ]}
      />
      <PageForm
        submitText={t`Save roles`}
        onSubmit={onSubmit}
        cancelText={t`Cancel`}
        onCancel={() =>
          pageNavigate(PlatformRoute.OrganizationUsers, {
            params: { id: organization.id, userId: user.id },
          })
        }
        defaultValue={defaultValue}
        disableGrid
      >
        <ResourceUserIndirectRolesPanel
          context={{
            resourceType: 'shared.organization',
            resourceId: organization?.id?.toString() ?? '',
            ansibleUserId: user?.summary_fields?.resource?.ansible_id ?? '',
            username: user.username,
            resourceName: organization.name,
          }}
          content={{
            alertLink: t`View indirectly assigned organization roles`,
            alertTitle: t`Indirectly assigned organization roles, which are inherited through a team assignment, cannot be managed here.`,
            alertDescription: t`To view these indirectly assigned roles click the button below. To modify these role assignments, manage the team's assignments.`,
            modalTitle: t('Indirectly assigned organization roles for {{username}}', {
              username: user.username ?? 'user',
            }),
            modalDescription: t`Below is a list of organization roles indirectly assigned to this user through a team assignment. These roles give this user permissions for all relevant resources within this organization. To modify roles assigned to the user from a team assignment manage the team's assignments.`,
          }}
        />
        <Content component={ContentVariants.p}>
          <Trans>
            Select organization roles that you want to directly assign to {user.username ?? 'user'}.
            These roles will apply to relevant resources within this organization.
            <br />
            <strong>Note:</strong> Removing the Organization Member role will remove{' '}
            {user.username ?? 'user'} from this organization.
          </Trans>
        </Content>
        <PageMultiSelectList
          view={view}
          tableColumns={tableColumns}
          toolbarFilters={toolbarFilters}
          labelForSelectedItems={t('Selected roles')}
          errorStateTitle={t('Error loading roles')}
        />
      </PageForm>
    </PageLayout>
  );
}
