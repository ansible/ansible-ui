import { ITableColumn, IToolbarFilter } from '@ansible/ansible-ui-framework';
import { TeamAssignment } from '@ansible/common-ui/access/interfaces/TeamAssignment';
import { useGetAll } from '@ansible/platform-ui/common/useGetAll';
import { useMemo, useRef } from 'react';
import { QueryParams, usePlatformView } from '../../../hooks/usePlatformView';
import { PlatformTeam } from '../../../interfaces/PlatformTeam';
import { gatewayAPI } from '../../../utils/gateway-api-utils';
import { orgTeamRoleAssignmentsUrl } from './orgTeamRoleAssignmentsUrl';

export type TeamRoleEntry = { name: string; id: number };

const ROLE_ASSIGNMENTS_PAGE_SIZE = 200;

// Returns a usePlatformView covering both org-member teams and cross-org teams
// that have been granted an org-level role on this org (AAP-83161 / AAP-83164),
// along with a map of team ID → role entries for the "Organization roles" column.
export function useOrganizationTeamsWithRoles(
  orgId: number | undefined,
  toolbarFilters: IToolbarFilter[],
  tableColumns: ITableColumn<PlatformTeam>[]
) {
  const assignmentsUrl = orgId ? orgTeamRoleAssignmentsUrl(orgId) : undefined;

  // Fetch all role_team_assignments scoped to this org to discover cross-org teams
  // and to build the role data for each team.
  const { items: roleAssignmentItems, isLoading: isLoadingAssignments } = useGetAll<TeamAssignment>(
    assignmentsUrl,
    ROLE_ASSIGNMENTS_PAGE_SIZE,
    null
  );

  const crossOrgTeamIdsFromItems = useMemo(() => {
    if (!roleAssignmentItems?.length) return '';
    return [...new Set(roleAssignmentItems.map((a) => a.team))].join(',');
  }, [roleAssignmentItems]);

  // Keep the last known cross-org IDs while assignments revalidate so /teams/ does not
  // briefly drop or__id__in and hide cross-org teams (useGetAll / SWR infinite).
  const crossOrgTeamIdsRef = useRef('');
  if (crossOrgTeamIdsFromItems) {
    crossOrgTeamIdsRef.current = crossOrgTeamIdsFromItems;
  }
  const crossOrgTeamIds =
    isLoadingAssignments && !crossOrgTeamIdsFromItems
      ? crossOrgTeamIdsRef.current
      : crossOrgTeamIdsFromItems;

  // Build queryParams: when cross-org IDs exist, OR the two filters so the view
  // returns org-member teams plus any teams with a role assignment on this org.
  // When no cross-org assignments exist, filter only by organization.
  const queryParams = useMemo(() => {
    const params: QueryParams = crossOrgTeamIds
      ? { or__organization: orgId?.toString() ?? '', or__id__in: crossOrgTeamIds }
      : { organization: orgId?.toString() ?? '' };
    return params;
  }, [crossOrgTeamIds, orgId]);

  // Build a map of team ID → role entries for the "Organization roles" column.
  const rolesByTeamId = useMemo(() => {
    const map = new Map<number, TeamRoleEntry[]>();
    roleAssignmentItems?.forEach((a) => {
      const existing = map.get(a.team) ?? [];
      map.set(a.team, [
        ...existing,
        {
          name: a.summary_fields.role_definition.name,
          id: a.summary_fields.role_definition.id,
        },
      ]);
    });
    return map;
  }, [roleAssignmentItems]);

  const view = usePlatformView<PlatformTeam>({
    url: gatewayAPI`/teams/`,
    queryParams,
    toolbarFilters,
    tableColumns,
  });

  const isLoadingRoleAssignments = Boolean(orgId && isLoadingAssignments && !roleAssignmentItems);

  return { view, rolesByTeamId, isLoadingRoleAssignments };
}
