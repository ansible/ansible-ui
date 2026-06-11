/**
 * InsightsRbacAccessWrapper - Wrapper component for Pulp RBAC-based access management
 *
 * This component combines data fetching, permission checking, and API operations
 * for resources that use Pulp's RBAC endpoints (list_roles, add_role, remove_role).
 *
 * Used by:
 * - Repositories (repositories/ansible/ansible)
 * - Remotes (remotes/ansible/collection)
 * - Execution Environments (pulp_container/namespaces)
 */
import { LoadingPage, usePageAlertToaster } from '@ansible/ansible-ui-framework';
import { useGet } from '@ansible/common-ui/crud/useGet';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { HubError } from '../HubError';
import { parsePulpIDFromURL } from '../api/hub-api-utils';
import { assignRoles, PulpRbacApi, UserWithRoles, GroupWithRoles } from '../api/pulp-rbac';
import { PulpItemsResponse } from '../useHubView';
import { PulpResource } from '../useInsightsRbacAccess';
import { InsightsAccessTab, InsightsAccessUser, InsightsAccessGroup } from './InsightsAccessTab';
import { InsightsApiUser } from './InsightsSelectUser';

interface InsightsRbacAccessWrapperProps {
  /** Function that takes the resource name/id and returns the API URL */
  getApiUrl: (id: string) => string;
  /** The RBAC API instance to use */
  rbacApi: PulpRbacApi;
  /** Error message to show when Pulp ID cannot be parsed */
  missingIdError: string;
  /** Pulp object type for role filtering (e.g., 'repositories/ansible/ansible') */
  pulpObjectType: string;
  /** Message to display in role selection wizard */
  selectRolesMessage: string;
}

/**
 * Generic wrapper component for Pulp RBAC-based access management
 */
export function InsightsRbacAccessWrapper({
  getApiUrl,
  rbacApi,
  missingIdError,
  pulpObjectType,
  selectRolesMessage,
}: Readonly<InsightsRbacAccessWrapperProps>) {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const alertToaster = usePageAlertToaster();

  const apiUrl = params.id ? getApiUrl(params.id) : '';

  // Fetch the resource to get pulp_href
  const {
    data: resourceData,
    error: resourceError,
    isLoading: resourceLoading,
    refresh: refreshResource,
  } = useGet<PulpItemsResponse<PulpResource>>(apiUrl);

  // Extract first resource from Pulp API response
  const resource = useMemo(() => {
    return resourceData?.results?.[0] ?? null;
  }, [resourceData]);

  const pulpId = parsePulpIDFromURL(resource?.pulp_href);
  const resourceName = resource?.name || params.id || '';

  // State for users and groups
  const [users, setUsers] = useState<UserWithRoles[]>([]);
  const [groups, setGroups] = useState<GroupWithRoles[]>([]);
  const [canEditOwners, setCanEditOwners] = useState(false);
  const [rbacLoading, setRbacLoading] = useState(true);
  const [rbacError, setRbacError] = useState<Error | null>(null);

  // Fetch RBAC data
  const fetchRbacData = useCallback(async () => {
    if (!pulpId) return;

    setRbacLoading(true);
    setRbacError(null);

    try {
      // Fetch roles - if this succeeds, user has access to the resource
      // TODO: handle pagination if more than 100 role assignments exist
      const rolesResult = await rbacApi.listRoles(pulpId, { page_size: 100 });

      // Transform roles into users and groups
      const { users: assignedUsers, groups: assignedGroups } = assignRoles(rolesResult.roles);
      setUsers(assignedUsers);
      setGroups(assignedGroups);

      // In Insights/CRC mode, if the user can successfully fetch roles for this object,
      // they have sufficient access to manage roles. The myPermissions API may not
      // return the expected permission strings, so we default to allowing edits
      // when the listRoles call succeeds.
      setCanEditOwners(true);
    } catch (err) {
      setRbacError(err instanceof Error ? err : new Error('Failed to fetch access data'));
      setUsers([]);
      setGroups([]);
      setCanEditOwners(false);
    } finally {
      setRbacLoading(false);
    }
  }, [pulpId, rbacApi]);

  // Fetch RBAC data when pulpId changes
  useEffect(() => {
    if (pulpId) {
      fetchRbacData().catch(() => {});
    }
  }, [pulpId, fetchRbacData]);

  // Refresh all data
  const refresh = useCallback(() => {
    refreshResource();
    fetchRbacData().catch(() => {});
  }, [refreshResource, fetchRbacData]);

  // Add a user with roles
  const handleAddUser = useCallback(
    async (user: InsightsApiUser, roles: string[]) => {
      if (!pulpId) return;

      try {
        // Add each role for the user
        await Promise.all(
          roles.map((role) => rbacApi.addRole(pulpId, { role, users: [user.username] }))
        );

        alertToaster.addAlert({
          title: t('User "{{name}}" has been successfully added to "{{resource}}".', {
            name: user.username,
            resource: resourceName,
          }),
          variant: 'success',
          timeout: 5000,
        });

        await fetchRbacData();
      } catch {
        alertToaster.addAlert({
          title: t('User "{{name}}" could not be added to "{{resource}}".', {
            name: user.username,
            resource: resourceName,
          }),
          variant: 'danger',
          timeout: 5000,
        });
      }
    },
    [pulpId, rbacApi, resourceName, alertToaster, fetchRbacData, t]
  );

  // Remove a user
  const handleRemoveUser = useCallback(
    async (user: InsightsAccessUser) => {
      if (!pulpId) return;

      const userName = user.name || user.username || '';

      try {
        // Remove all roles for the user
        await Promise.all(
          user.object_roles.map((role) => rbacApi.removeRole(pulpId, { role, users: [userName] }))
        );

        alertToaster.addAlert({
          title: t('User "{{name}}" has been successfully removed from "{{resource}}".', {
            name: userName,
            resource: resourceName,
          }),
          variant: 'success',
          timeout: 5000,
        });

        await fetchRbacData();
      } catch {
        alertToaster.addAlert({
          title: t('User "{{name}}" could not be removed from "{{resource}}".', {
            name: userName,
            resource: resourceName,
          }),
          variant: 'danger',
          timeout: 5000,
        });
      }
    },
    [pulpId, rbacApi, resourceName, alertToaster, fetchRbacData, t]
  );

  // Add roles to a user
  const handleAddUserRoles = useCallback(
    async (user: InsightsAccessUser, roles: string[]) => {
      if (!pulpId) return;

      const userName = user.name || user.username || '';

      try {
        await Promise.all(
          roles.map((role) => rbacApi.addRole(pulpId, { role, users: [userName] }))
        );

        alertToaster.addAlert({
          title: t('User "{{name}}" roles successfully updated in "{{resource}}".', {
            name: userName,
            resource: resourceName,
          }),
          variant: 'success',
          timeout: 5000,
        });

        await fetchRbacData();
      } catch {
        alertToaster.addAlert({
          title: t('User "{{name}}" roles could not be updated in "{{resource}}".', {
            name: userName,
            resource: resourceName,
          }),
          variant: 'danger',
          timeout: 5000,
        });
      }
    },
    [pulpId, rbacApi, resourceName, alertToaster, fetchRbacData, t]
  );

  // Remove a role from a user
  const handleRemoveUserRole = useCallback(
    async (user: InsightsAccessUser, role: string) => {
      if (!pulpId) return;

      const userName = user.name || user.username || '';

      try {
        await rbacApi.removeRole(pulpId, { role, users: [userName] });

        alertToaster.addAlert({
          title: t('User "{{name}}" roles successfully updated in "{{resource}}".', {
            name: userName,
            resource: resourceName,
          }),
          variant: 'success',
          timeout: 5000,
        });

        await fetchRbacData();
      } catch {
        alertToaster.addAlert({
          title: t('User "{{name}}" roles could not be updated in "{{resource}}".', {
            name: userName,
            resource: resourceName,
          }),
          variant: 'danger',
          timeout: 5000,
        });
      }
    },
    [pulpId, rbacApi, resourceName, alertToaster, fetchRbacData, t]
  );

  // Add a group with roles
  const handleAddGroup = useCallback(
    async (group: { id?: number; name: string; pulp_href?: string }, roles: string[]) => {
      if (!pulpId) return;

      try {
        await Promise.all(
          roles.map((role) => rbacApi.addRole(pulpId, { role, groups: [group.name] }))
        );

        alertToaster.addAlert({
          title: t('Group "{{name}}" has been successfully added to "{{resource}}".', {
            name: group.name,
            resource: resourceName,
          }),
          variant: 'success',
          timeout: 5000,
        });

        await fetchRbacData();
      } catch {
        alertToaster.addAlert({
          title: t('Group "{{name}}" could not be added to "{{resource}}".', {
            name: group.name,
            resource: resourceName,
          }),
          variant: 'danger',
          timeout: 5000,
        });
      }
    },
    [pulpId, rbacApi, resourceName, alertToaster, fetchRbacData, t]
  );

  // Remove a group
  const handleRemoveGroup = useCallback(
    async (group: InsightsAccessGroup) => {
      if (!pulpId) return;

      try {
        await Promise.all(
          group.object_roles.map((role) =>
            rbacApi.removeRole(pulpId, { role, groups: [group.name] })
          )
        );

        alertToaster.addAlert({
          title: t('Group "{{name}}" has been successfully removed from "{{resource}}".', {
            name: group.name,
            resource: resourceName,
          }),
          variant: 'success',
          timeout: 5000,
        });

        await fetchRbacData();
      } catch {
        alertToaster.addAlert({
          title: t('Group "{{name}}" could not be removed from "{{resource}}".', {
            name: group.name,
            resource: resourceName,
          }),
          variant: 'danger',
          timeout: 5000,
        });
      }
    },
    [pulpId, rbacApi, resourceName, alertToaster, fetchRbacData, t]
  );

  // Add roles to a group
  const handleAddGroupRoles = useCallback(
    async (group: InsightsAccessGroup, roles: string[]) => {
      if (!pulpId) return;

      try {
        await Promise.all(
          roles.map((role) => rbacApi.addRole(pulpId, { role, groups: [group.name] }))
        );

        alertToaster.addAlert({
          title: t('Group "{{name}}" roles successfully updated in "{{resource}}".', {
            name: group.name,
            resource: resourceName,
          }),
          variant: 'success',
          timeout: 5000,
        });

        await fetchRbacData();
      } catch {
        alertToaster.addAlert({
          title: t('Group "{{name}}" roles could not be updated in "{{resource}}".', {
            name: group.name,
            resource: resourceName,
          }),
          variant: 'danger',
          timeout: 5000,
        });
      }
    },
    [pulpId, rbacApi, resourceName, alertToaster, fetchRbacData, t]
  );

  // Remove a role from a group
  const handleRemoveGroupRole = useCallback(
    async (group: InsightsAccessGroup, role: string) => {
      if (!pulpId) return;

      try {
        await rbacApi.removeRole(pulpId, { role, groups: [group.name] });

        alertToaster.addAlert({
          title: t('Group "{{name}}" roles successfully updated in "{{resource}}".', {
            name: group.name,
            resource: resourceName,
          }),
          variant: 'success',
          timeout: 5000,
        });

        await fetchRbacData();
      } catch {
        alertToaster.addAlert({
          title: t('Group "{{name}}" roles could not be updated in "{{resource}}".', {
            name: group.name,
            resource: resourceName,
          }),
          variant: 'danger',
          timeout: 5000,
        });
      }
    },
    [pulpId, rbacApi, resourceName, alertToaster, fetchRbacData, t]
  );

  // Handle loading states
  if (resourceLoading) {
    return <LoadingPage />;
  }

  if (resourceError) {
    return <HubError error={resourceError} handleRefresh={refresh} />;
  }

  if (!pulpId) {
    return <HubError error={new Error(missingIdError)} handleRefresh={refresh} />;
  }

  if (rbacLoading) {
    return <LoadingPage />;
  }

  if (rbacError) {
    return <HubError error={rbacError} handleRefresh={refresh} />;
  }

  // Transform users to match InsightsAccessUser interface (use 'name' instead of 'username')
  const transformedUsers: InsightsAccessUser[] = users.map((u) => ({
    name: u.username,
    object_roles: u.object_roles,
  }));

  return (
    <InsightsAccessTab
      resourceName={resourceName}
      users={transformedUsers}
      groups={groups}
      canEditOwners={canEditOwners}
      pulpObjectType={pulpObjectType}
      selectRolesMessage={selectRolesMessage}
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
