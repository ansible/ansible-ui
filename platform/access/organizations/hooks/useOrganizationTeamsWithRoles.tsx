import { IToolbarFilter } from '@ansible/ansible-ui-framework';
import { TeamAssignment } from '@ansible/common-ui/access/interfaces/TeamAssignment';
import { useGet } from '@ansible/common-ui/crud/useGet';
import { useMemo } from 'react';
import { QueryParams, usePlatformView } from '../../../hooks/usePlatformView';
import { PlatformTeam } from '../../../interfaces/PlatformTeam';
import { gatewayAPI } from '../../../utils/gateway-api-utils';

export type TeamRoleEntry = { name: string; id: number };

// Returns a usePlatformView covering both org-member teams and cross-org teams
// that have been granted an org-level role on this org (AAP-83161 / AAP-83164),
// along with a map of team ID → role entries for the "Organization roles" column.
export function useOrganizationTeamsWithRoles(
  orgId: number | undefined,
  toolbarFilters: IToolbarFilter[]
) {
  // Fetch all role_team_assignments scoped to this org to discover cross-org teams
  // and to build the role data for each team.
  const { data: roleAssignments } = useGet<{ results: TeamAssignment[] }>(
    orgId
      ? gatewayAPI`/role_team_assignments/?object_id=${orgId}&content_type__api_slug=shared.organization&page_size=200`
      : undefined
  );

  // Extract unique team IDs from the role assignments.
  const crossOrgTeamIds = useMemo(() => {
    if (!roleAssignments?.results?.length) return '';
    return [...new Set(roleAssignments.results.map((a) => a.team))].join(',');
  }, [roleAssignments?.results]);

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
    roleAssignments?.results?.forEach((a) => {
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
  }, [roleAssignments?.results]);

  const view = usePlatformView<PlatformTeam>({
    url: gatewayAPI`/teams/`,
    queryParams,
    toolbarFilters,
  });

  return { view, rolesByTeamId };
}
