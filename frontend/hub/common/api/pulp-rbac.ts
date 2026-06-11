/**
 * Pulp RBAC API utilities for Insights mode
 *
 * These functions provide direct access to Pulp's RBAC endpoints,
 * bypassing the Gateway API which is not available in Insights/CRC mode.
 */
import { pulpAPI } from './formatPath';
import { getHubRequest, postHubRequest } from './request';

export interface PulpRole {
  role: string;
  users: string[];
  groups: string[];
}

export interface PulpRolesResponse {
  roles: PulpRole[];
}

export interface PulpPermissionsResponse {
  permissions: string[];
}

export interface UserWithRoles {
  username: string;
  object_roles: string[];
}

export interface GroupWithRoles {
  name: string;
  object_roles: string[];
}

export interface AssignedRoles {
  users: UserWithRoles[];
  groups: GroupWithRoles[];
}

/**
 * Transforms the Pulp roles response into a structure with users and groups
 * each having their associated roles.
 */
export function assignRoles(roles: PulpRole[]): AssignedRoles {
  const userRoles: Record<string, string[]> = {};
  const groupRoles: Record<string, string[]> = {};

  roles.forEach(({ users, groups, role }) => {
    (users || []).forEach((username) => {
      userRoles[username] = userRoles[username] || [];
      userRoles[username].push(role);
    });
    (groups || []).forEach((name) => {
      groupRoles[name] = groupRoles[name] || [];
      groupRoles[name].push(role);
    });
  });

  const sortedUsers = Object.entries(userRoles)
    .map(([username, object_roles]) => ({ username, object_roles }))
    .sort((a, b) => a.username.localeCompare(b.username));

  const sortedGroups = Object.entries(groupRoles)
    .map(([name, object_roles]) => ({ name, object_roles }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return {
    users: sortedUsers,
    groups: sortedGroups,
  };
}

/**
 * Pulp RBAC API class for managing roles on Pulp objects
 */
export class PulpRbacApi {
  private readonly apiPath: string;

  constructor(apiPath: string) {
    this.apiPath = apiPath;
  }

  /**
   * List roles assigned to an object
   */
  async listRoles(
    id: string,
    params?: Record<string, string | number>
  ): Promise<PulpRolesResponse> {
    const queryString = params
      ? '?' + new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)])).toString()
      : '';
    const baseUrl = pulpAPI`/${this.apiPath}/${id}/list_roles/`;
    const url = queryString ? baseUrl.replace(/\/$/, '') + queryString : baseUrl;
    const { response } = await getHubRequest<PulpRolesResponse>(url);
    return response as PulpRolesResponse;
  }

  /**
   * Get my permissions on an object
   */
  async myPermissions(id: string): Promise<PulpPermissionsResponse> {
    const url = pulpAPI`/${this.apiPath}/${id}/my_permissions/`;
    const { response } = await getHubRequest<PulpPermissionsResponse>(url);
    return response as PulpPermissionsResponse;
  }

  /**
   * Add a role to users or groups on an object
   */
  async addRole(
    id: string,
    data: { role: string; users?: string[]; groups?: string[] }
  ): Promise<void> {
    const url = pulpAPI`/${this.apiPath}/${id}/add_role/`;
    await postHubRequest(url, data);
  }

  /**
   * Remove a role from users or groups on an object
   */
  async removeRole(
    id: string,
    data: { role: string; users?: string[]; groups?: string[] }
  ): Promise<void> {
    const url = pulpAPI`/${this.apiPath}/${id}/remove_role/`;
    await postHubRequest(url, data);
  }
}

// Pre-configured API instances for common Pulp object types
export const AnsibleRemoteRbacAPI = new PulpRbacApi('remotes/ansible/collection');
export const AnsibleRepositoryRbacAPI = new PulpRbacApi('repositories/ansible/ansible');
export const ContainerNamespaceRbacAPI = new PulpRbacApi('pulp_container/namespaces');
