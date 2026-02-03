/**
 * useInsightsRbacAccess - Shared hook for fetching RBAC data in Insights/CRC mode
 *
 * This hook abstracts the common pattern of:
 * 1. Fetching a resource from Pulp API
 * 2. Extracting the pulp_href and parsing the Pulp ID
 * 3. Fetching RBAC roles for that resource
 * 4. Transforming roles into users/groups with their assigned roles
 *
 * Used by InsightsRemoteAccess and InsightsRepositoryAccess.
 */
import { useCallback, useEffect, useState } from 'react';
import { useGet } from '@ansible/common-ui/crud/useGet';
import { PulpRbacApi, assignRoles, UserWithRoles, GroupWithRoles } from './api/pulp-rbac';
import { parsePulpIDFromURL } from './api/hub-api-utils';

interface PulpResource {
  pulp_href?: string;
  name?: string;
}

interface PulpItemsResponse<T> {
  results?: T[];
}

export interface InsightsRbacAccessResult {
  /** Users with their assigned roles */
  users: UserWithRoles[];
  /** Groups with their assigned roles */
  groups: GroupWithRoles[];
  /** Name of the resource for display */
  resourceName?: string;
  /** Error from fetching the resource */
  resourceError: Error | undefined;
  /** Error from fetching RBAC data */
  rbacError: Error | null;
  /** Whether the resource is still loading */
  resourceLoading: boolean;
  /** Whether RBAC data is still loading */
  rbacLoading: boolean;
  /** The Pulp ID (null if not yet available or failed to parse) */
  pulpId: string | null;
  /** Function to refresh all data */
  refresh: () => void;
}

interface UseInsightsRbacAccessOptions<T extends PulpResource> {
  /** The API URL to fetch the resource (should return PulpItemsResponse<T>) */
  apiUrl: string;
  /** The RBAC API instance to use for fetching roles */
  rbacApi: PulpRbacApi;
  /** Function to extract the resource from the response (default: response.results?.[0]) */
  extractResource?: (data: PulpItemsResponse<T> | undefined) => T | undefined;
}

/**
 * Hook for fetching Insights RBAC access data for Pulp resources
 */
export function useInsightsRbacAccess<T extends PulpResource>({
  apiUrl,
  rbacApi,
  extractResource = (data) => data?.results?.[0],
}: UseInsightsRbacAccessOptions<T>): InsightsRbacAccessResult {
  const {
    data,
    error: resourceError,
    refresh: refreshResource,
  } = useGet<PulpItemsResponse<T>>(apiUrl);

  const [users, setUsers] = useState<UserWithRoles[]>([]);
  const [groups, setGroups] = useState<GroupWithRoles[]>([]);
  const [rbacError, setRbacError] = useState<Error | null>(null);
  const [rbacLoading, setRbacLoading] = useState(true);

  const resource = extractResource(data);
  const pulpId = parsePulpIDFromURL(resource?.pulp_href);

  const fetchRbacData = useCallback(async () => {
    if (!pulpId) return;

    setRbacLoading(true);
    setRbacError(null);

    try {
      // TODO: handle pagination if more than 100 role assignments exist
      const rolesResponse = await rbacApi.listRoles(pulpId, { limit: 100 });
      const { users: assignedUsers, groups: assignedGroups } = assignRoles(
        rolesResponse?.roles || []
      );
      setUsers(assignedUsers);
      setGroups(assignedGroups);
    } catch (err) {
      setRbacError(err as Error);
      setUsers([]);
      setGroups([]);
    } finally {
      setRbacLoading(false);
    }
  }, [pulpId, rbacApi]);

  useEffect(() => {
    if (pulpId) {
      fetchRbacData().catch(() => {});
    }
  }, [pulpId, fetchRbacData]);

  const refresh = useCallback(() => {
    refreshResource();
    fetchRbacData().catch(() => {});
  }, [refreshResource, fetchRbacData]);

  return {
    users,
    groups,
    resourceName: resource?.name,
    resourceError,
    rbacError,
    resourceLoading: !data && !resourceError,
    rbacLoading,
    pulpId,
    refresh,
  };
}
