import { gatewayAPI } from '../../../utils/gateway-api-utils';

/** SWR cache prefix for invalidating org team role assignment lists after mutations. */
export const ROLE_TEAM_ASSIGNMENTS_CACHE_KEY = gatewayAPI`/role_team_assignments/`;

export function orgTeamRoleAssignmentsUrl(orgId: number) {
  return gatewayAPI`/role_team_assignments/?object_id=${orgId.toString()}&content_type__api_slug=shared.organization`;
}
