/**
 * InsightsNamespaceAccess - Access tab for namespaces in Insights/CRC mode
 *
 * This component provides full access management functionality for namespaces.
 * Unlike remotes and repositories which use Pulp RBAC endpoints, namespaces
 * have access data embedded directly on the namespace object and are updated via PUT.
 *
 * This component handles both owned namespaces and partner namespaces:
 * - First tries /_ui/v1/my-namespaces/ (returns data if user owns the namespace)
 * - Falls back to /_ui/v1/namespaces/ (for partner namespaces not owned by user)
 *
 * This approach is needed because the "All" tab mixes both owned and partner namespaces,
 * so we can't rely on the URL to determine which API to use.
 */
import { useCallback, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { LoadingPage, usePageAlertToaster } from '@ansible/ansible-ui-framework';
import { useGet } from '@ansible/common-ui/crud/useGet';
import { useTranslation } from 'react-i18next';
import { hubAPI } from '../../common/api/formatPath';
import { putHubRequest } from '../../common/api/request';
import { HubError } from '../../common/HubError';
import { HubItemsResponse } from '../../common/useHubView';
import {
  InsightsAccessTab,
  InsightsAccessUser,
  InsightsAccessGroup,
} from '../../common/components/InsightsAccessTab';
import { InsightsApiUser } from '../../common/components/InsightsSelectUser';
import { HubNamespace, HubNamespaceUser, HubNamespaceGroup } from '../HubNamespace';

/**
 * Helper to get user display name from namespace user object.
 * Supports both 'name' (from namespace GET response) and 'username' (from users API).
 */
const getUserName = (user: HubNamespaceUser): string => user.name || user.username || '';

export function InsightsNamespaceAccess() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const alertToaster = usePageAlertToaster();
  const [isUpdating, setIsUpdating] = useState(false);

  // First, try to fetch from my-namespaces (returns data if user owns the namespace)
  const myNamespaceUrl = params.id
    ? hubAPI`/_ui/v1/my-namespaces/?limit=1&name=${params.id}&include_related=my_permissions`
    : undefined;
  const {
    data: myNamespaceData,
    error: myNamespaceError,
    refresh: refreshMyNamespace,
  } = useGet<HubItemsResponse<HubNamespace>>(myNamespaceUrl);

  // Determine if namespace was found in my-namespaces (user owns it)
  const isMyNamespace = (myNamespaceData?.data?.length ?? 0) > 0;

  // If not found in my-namespaces, fetch from general namespaces API (partner namespace)
  const partnerUrl =
    myNamespaceData && !isMyNamespace && params.id
      ? hubAPI`/_ui/v1/namespaces/?limit=1&name=${params.id}&include_related=my_permissions`
      : undefined;
  const {
    data: partnerData,
    error: partnerError,
    refresh: refreshPartner,
  } = useGet<HubItemsResponse<HubNamespace>>(partnerUrl);

  // Use data from whichever API returned results
  const data = isMyNamespace ? myNamespaceData : partnerData;
  const error = isMyNamespace ? myNamespaceError : partnerError;
  const refresh = isMyNamespace ? refreshMyNamespace : refreshPartner;

  const namespace = data?.data?.[0];
  const users = useMemo(() => namespace?.users || [], [namespace?.users]);
  const groups = useMemo(() => namespace?.groups || [], [namespace?.groups]);

  // Check if user can edit based on permissions
  const canEditOwners =
    namespace?.related_fields?.my_permissions?.includes('galaxy.change_namespace') ?? false;

  // Helper to update namespace with new users/groups
  const updateNamespace = useCallback(
    async (
      updates: { users?: HubNamespaceUser[]; groups?: HubNamespaceGroup[] },
      successMessage: string,
      failureMessage: string
    ) => {
      if (!namespace || !params.id) return;

      setIsUpdating(true);
      try {
        // Use the appropriate API based on whether this is an owned or partner namespace
        const updateUrl = isMyNamespace
          ? hubAPI`/_ui/v1/my-namespaces/${params.id}/`
          : hubAPI`/_ui/v1/namespaces/${params.id}/`;
        await putHubRequest(updateUrl, {
          ...namespace,
          users: updates.users ?? namespace.users,
          groups: updates.groups ?? namespace.groups,
        });

        alertToaster.addAlert({
          title: successMessage,
          variant: 'success',
          timeout: 5000,
        });

        refresh();
      } catch {
        alertToaster.addAlert({
          title: failureMessage,
          variant: 'danger',
          timeout: 5000,
        });
      } finally {
        setIsUpdating(false);
      }
    },
    [namespace, params.id, alertToaster, refresh, isMyNamespace]
  );

  // Add a user with roles
  // Spreads the full API user object (id, username, email, groups, etc.)
  // to match the payload format expected by the /_ui/v1/my-namespaces/ PUT endpoint.
  const handleAddUser = useCallback(
    async (user: InsightsApiUser, roles: string[]) => {
      const newUser: HubNamespaceUser = {
        ...user,
        object_roles: roles,
      };
      const newUsers = [...users, newUser];
      await updateNamespace(
        { users: newUsers },
        t('User "{{name}}" has been successfully added to "{{namespace}}".', {
          name: user.username,
          namespace: namespace?.name,
        }),
        t('User "{{name}}" could not be added to "{{namespace}}".', {
          name: user.username,
          namespace: namespace?.name,
        })
      );
    },
    [users, namespace?.name, updateNamespace, t]
  );

  // Remove a user
  const handleRemoveUser = useCallback(
    async (user: InsightsAccessUser) => {
      const userName = user.name || user.username || '';
      const newUsers = users.filter((u) => getUserName(u) !== userName);
      await updateNamespace(
        { users: newUsers },
        t('User "{{name}}" has been successfully removed from "{{namespace}}".', {
          name: userName,
          namespace: namespace?.name,
        }),
        t('User "{{name}}" could not be removed from "{{namespace}}".', {
          name: userName,
          namespace: namespace?.name,
        })
      );
    },
    [users, namespace?.name, updateNamespace, t]
  );

  // Add roles to a user
  const handleAddUserRoles = useCallback(
    async (user: InsightsAccessUser, roles: string[]) => {
      const userName = user.name || user.username || '';
      const existingUser = users.find((u) => getUserName(u) === userName);
      if (!existingUser) return;

      const newUser = {
        ...existingUser,
        object_roles: [...existingUser.object_roles, ...roles],
      };
      const newUsers = users.map((u) => (getUserName(u) === userName ? newUser : u));
      await updateNamespace(
        { users: newUsers },
        t('User "{{name}}" roles successfully updated in "{{namespace}}".', {
          name: userName,
          namespace: namespace?.name,
        }),
        t('User "{{name}}" roles could not be updated in "{{namespace}}".', {
          name: userName,
          namespace: namespace?.name,
        })
      );
    },
    [users, namespace?.name, updateNamespace, t]
  );

  // Remove a role from a user
  const handleRemoveUserRole = useCallback(
    async (user: InsightsAccessUser, role: string) => {
      const userName = user.name || user.username || '';
      const existingUser = users.find((u) => getUserName(u) === userName);
      if (!existingUser) return;

      const newUser = {
        ...existingUser,
        object_roles: existingUser.object_roles.filter((r) => r !== role),
      };
      const newUsers = users.map((u) => (getUserName(u) === userName ? newUser : u));
      await updateNamespace(
        { users: newUsers },
        t('User "{{name}}" roles successfully updated in "{{namespace}}".', {
          name: userName,
          namespace: namespace?.name,
        }),
        t('User "{{name}}" roles could not be updated in "{{namespace}}".', {
          name: userName,
          namespace: namespace?.name,
        })
      );
    },
    [users, namespace?.name, updateNamespace, t]
  );

  // Add a group with roles
  const handleAddGroup = useCallback(
    async (group: { id?: number; name: string; pulp_href?: string }, roles: string[]) => {
      // Spread the full group object to preserve id and pulp_href from the selected group
      const newGroup: HubNamespaceGroup = {
        ...group,
        id: group.id ?? 0,
        object_roles: roles,
      };
      const newGroups = [...groups, newGroup];
      await updateNamespace(
        { groups: newGroups },
        t('Group "{{name}}" has been successfully added to "{{namespace}}".', {
          name: group.name,
          namespace: namespace?.name,
        }),
        t('Group "{{name}}" could not be added to "{{namespace}}".', {
          name: group.name,
          namespace: namespace?.name,
        })
      );
    },
    [groups, namespace?.name, updateNamespace, t]
  );

  // Remove a group
  const handleRemoveGroup = useCallback(
    async (group: InsightsAccessGroup) => {
      const newGroups = groups.filter((g) => g.name !== group.name);
      await updateNamespace(
        { groups: newGroups },
        t('Group "{{name}}" has been successfully removed from "{{namespace}}".', {
          name: group.name,
          namespace: namespace?.name,
        }),
        t('Group "{{name}}" could not be removed from "{{namespace}}".', {
          name: group.name,
          namespace: namespace?.name,
        })
      );
    },
    [groups, namespace?.name, updateNamespace, t]
  );

  // Add roles to a group
  const handleAddGroupRoles = useCallback(
    async (group: InsightsAccessGroup, roles: string[]) => {
      const existingGroup = groups.find((g) => g.name === group.name);
      if (!existingGroup) return;

      const newGroup = {
        ...existingGroup,
        object_roles: [...existingGroup.object_roles, ...roles],
      };
      const newGroups = groups.map((g) => (g.name === group.name ? newGroup : g));
      await updateNamespace(
        { groups: newGroups },
        t('Group "{{name}}" roles successfully updated in "{{namespace}}".', {
          name: group.name,
          namespace: namespace?.name,
        }),
        t('Group "{{name}}" roles could not be updated in "{{namespace}}".', {
          name: group.name,
          namespace: namespace?.name,
        })
      );
    },
    [groups, namespace?.name, updateNamespace, t]
  );

  // Remove a role from a group
  const handleRemoveGroupRole = useCallback(
    async (group: InsightsAccessGroup, role: string) => {
      const existingGroup = groups.find((g) => g.name === group.name);
      if (!existingGroup) return;

      const newGroup = {
        ...existingGroup,
        object_roles: existingGroup.object_roles.filter((r) => r !== role),
      };
      const newGroups = groups.map((g) => (g.name === group.name ? newGroup : g));
      await updateNamespace(
        { groups: newGroups },
        t('Group "{{name}}" roles successfully updated in "{{namespace}}".', {
          name: group.name,
          namespace: namespace?.name,
        }),
        t('Group "{{name}}" roles could not be updated in "{{namespace}}".', {
          name: group.name,
          namespace: namespace?.name,
        })
      );
    },
    [groups, namespace?.name, updateNamespace, t]
  );

  // Show loading while fetching:
  // 1. If my-namespaces fetch is still in progress
  // 2. If my-namespaces returned no data and partner fetch is in progress
  const isLoading =
    (!myNamespaceData && !myNamespaceError) ||
    (myNamespaceData && !isMyNamespace && !partnerData && !partnerError) ||
    isUpdating;

  if (isLoading) {
    return <LoadingPage />;
  }

  if (error) {
    return <HubError error={error} handleRefresh={refresh} />;
  }

  // Transform users to match InsightsAccessUser interface
  // Include both 'name' and 'username' since the server may return either field
  const transformedUsers: InsightsAccessUser[] = users.map((u) => ({
    name: u.name,
    username: u.username,
    object_roles: u.object_roles,
  }));

  return (
    <InsightsAccessTab
      resourceName={namespace?.name || ''}
      users={transformedUsers}
      groups={groups}
      canEditOwners={canEditOwners}
      pulpObjectType="pulp_ansible/namespaces"
      selectRolesMessage={t('The selected roles will be added to this specific namespace.')}
      onAddUser={handleAddUser}
      onRemoveUser={handleRemoveUser}
      onAddUserRoles={handleAddUserRoles}
      onRemoveUserRole={handleRemoveUserRole}
      onAddGroup={handleAddGroup}
      onRemoveGroup={handleRemoveGroup}
      onAddGroupRoles={handleAddGroupRoles}
      onRemoveGroupRole={handleRemoveGroupRole}
    />
  );
}
