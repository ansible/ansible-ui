import { PageForm, QueryParams, useBulkActionDialog } from '@ansible/ansible-ui-framework';
import { PageMultiSelectList } from '@ansible/ansible-ui-framework/PageTable/PageMultiSelectList';
import { getAddedAndRemovedPlatformRoles } from '@ansible/platform-ui/access/organizations/utils/getAddedAndRemovedPlatformRoles';
import { usePlatformRoleColumns } from '@ansible/platform-ui/access/roles/hooks/usePlatformRoleColumns';
import { usePlatformRolesFilters } from '@ansible/platform-ui/access/roles/hooks/usePlatformRolesFilters';
import { useGetPlatformRolesForUser } from '@ansible/platform-ui/access/users/hooks/useGetPlatformRolesForUser';
import { usePlatformView } from '@ansible/platform-ui/hooks/usePlatformView';
import { PlatformRbacRole } from '@ansible/platform-ui/interfaces/PlatformRbacRole';
import { PlatformUser } from '@ansible/platform-ui/interfaces/PlatformUser';
import { gatewayAPI } from '@ansible/platform-ui/utils/gateway-api-utils';
import { Content, ContentVariants } from '@patternfly/react-core';
import { useCallback, useEffect, useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { postRequest, requestDelete } from '../../crud/Data';
import { ResourceUserIndirectRolesPanel } from '@ansible/common-ui/access/indirect-roles/components/ResourceUserIndirectRolesPanel';
import { OrganizationUsersLink } from '@ansible/platform-ui/access/organizations/utils/OrganizationUsersLink';

interface RemoveRole {
  remove?: boolean;
  roleAssignmentId?: number;
}
interface UserAndPlatformRole {
  user?: PlatformUser;
  platformRole: PlatformRbacRole & RemoveRole;
}
export interface ResourceType {
  id: string;
  name: string;
  organization?: { id: string; name: string };
  summary_fields: {
    organization: { id: string; name: string };
  };
}

export function ManageResourceRoles(props: { resource?: ResourceType; user?: PlatformUser }) {
  const toolbarFilters = usePlatformRolesFilters();
  const { resource } = props;
  const { t } = useTranslation();
  const navigate = useNavigate();
  const progressDialog = useBulkActionDialog<UserAndPlatformRole>();

  const orgName = resource?.organization?.name ?? resource?.summary_fields?.organization?.name;

  const params = useParams<{
    resource_type: string;
    resource_id: string;
    user_id: string;
  }>();
  const user = props?.user;

  const { selectedRoles: initialRoles } = useGetPlatformRolesForUser(
    params.resource_type ?? '',
    params.resource_id ?? '',
    `${user?.id ?? ''}`
  );
  const defaultValue = useMemo(
    () => ({
      platformRoles: initialRoles ?? [],
    }),
    [initialRoles]
  );
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
      if (item.platformRole) {
        if (item.platformRole.remove) {
          return requestDelete(
            gatewayAPI`/role_user_assignments/` +
              `${item.platformRole.roleAssignmentId?.toString()}/`,
            signal
          );
        } else {
          return postRequest(
            gatewayAPI`/role_user_assignments/`,
            {
              user: item?.user?.id ?? '',
              role_definition: item.platformRole.id,
              content_type__api_slug: params.resource_type,
              object_id: params.resource_id,
            },
            signal
          );
        }
      }
    },
    [params.resource_id, params.resource_type]
  );

  const onSubmit = () => {
    const updatedPlatformRoles = view.selectedItems;
    const platformRolesData: (PlatformRbacRole & { remove?: boolean })[] = [];

    if (initialRoles?.length) {
      const platformRoles = getAddedAndRemovedPlatformRoles(
        initialRoles as (PlatformRbacRole & RemoveRole)[],
        updatedPlatformRoles
      );
      platformRolesData.push(...(platformRoles as (PlatformRbacRole & { remove?: boolean })[]));
    } else {
      platformRolesData.push(...updatedPlatformRoles);
    }

    const platformUserRolePairs: UserAndPlatformRole[] = [];
    if (platformRolesData) {
      for (const platformRole of platformRolesData) {
        platformUserRolePairs.push({ user, platformRole });
      }
    }
    const items = platformUserRolePairs;

    return new Promise<void>((resolve) => {
      progressDialog({
        title: t('Manage roles'),
        description: <Trans>The roles listed below have been changed.</Trans>,
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
          void navigate(-1);
        },
      });
    });
  };

  const onCancel = () => void navigate(-1);

  const tableColumns = usePlatformRoleColumns({ disableLinks: true, disableExtraColumns: true });

  const queryParams = useMemo<QueryParams>(() => {
    const queryParams: QueryParams = { content_type__api_slug: params.resource_type ?? '' };
    return queryParams;
  }, [params.resource_type]);

  const view = usePlatformView<PlatformRbacRole>({
    url: gatewayAPI`/role_definitions/`,
    toolbarFilters,
    tableColumns,
    queryParams,
    defaultSelection: initialRoles,
    disableQueryString: true,
  });

  return (
    <PageForm
      submitText={t`Save roles`}
      onSubmit={onSubmit}
      cancelText={t`Cancel`}
      onCancel={onCancel}
      defaultValue={defaultValue}
      disableGrid
    >
      <ResourceUserIndirectRolesPanel
        context={{
          resourceType: params.resource_type ?? '',
          resourceId: params.resource_id ?? '',
          ansibleUserId: params.user_id ?? '',
          username: user?.username,
          resourceName: resource?.name,
        }}
        content={{
          alertTitle: t(
            `Indirectly assigned roles, which are inherited through a team assignment, and organization roles that give {{username}} access to {{resourceName}} cannot be managed here.`,
            {
              username: user?.username ?? 'user',
              resourceName: resource?.name ?? 'resource',
            }
          ),
          alertDescription: (
            <Trans i18nKey="indirectRolesAlert">
              To view these indirectly assigned roles click the button below. To modify indirect
              assignments manage the team&apos;s assignments, to modify directly assigned
              organization roles, manage{' '}
              {orgName ? <OrganizationUsersLink organizationName={orgName} /> : t('organization')}{' '}
              role assignments for this user.
            </Trans>
          ),
          modalDescription: t(
            `Below is a list of roles indirectly assigned to this user through a team assignment for {{resourceName}}. To modify roles assigned to this user from a team assignment manage the team's assignments.`,
            { resourceName: resource?.name ?? 'resource' }
          ),
        }}
      />
      <Content component={ContentVariants.p}>
        {t('Selected roles will be directly assigned to {{username}}.', {
          username: user?.username ?? '',
        })}
      </Content>
      <PageMultiSelectList
        view={view}
        tableColumns={tableColumns}
        toolbarFilters={toolbarFilters}
        labelForSelectedItems={t('Selected roles')}
        errorStateTitle={t('Error loading roles')}
      />
    </PageForm>
  );
}
