import { PlatformTeam } from '../../../interfaces/PlatformTeam';
import { PlatformOrganization } from '@ansible/platform-ui/interfaces/PlatformOrganization';
import { TeamAssignment } from '@ansible/common-ui/access/interfaces/TeamAssignment';
import { useGet } from '@ansible/common-ui/crud/useGet';
import { useMemo } from 'react';
import { gatewayAPI } from '../../../utils/gateway-api-utils';
import { PlatformRole } from '../../../interfaces/PlatformRole';

interface RemoveRole {
  remove?: boolean;
  roleAssignmentId?: number;
}

export function useGetOrganizationRolesForTeam(
  platformOrg?: PlatformOrganization,
  platformTeam?: PlatformTeam
) {
  const gatewayApiUrl =
    platformTeam && platformOrg
      ? gatewayAPI`/role_team_assignments/?team_id=${platformTeam.id}&object_id=${platformOrg.id}`
      : undefined;
  const { data: roleAssignmentsData, isLoading: isLoadingRoleAssignments } = useGet<{
    results: TeamAssignment[];
  }>(gatewayApiUrl);
  const { data: roles, isLoading: isLoadingRoles } = useGet<{ results: PlatformRole[] }>(
    gatewayAPI`/role_definitions/?content_type__api_slug=shared.organization`
  );

  return useMemo(() => {
    if (isLoadingRoleAssignments || isLoadingRoles) {
      return {
        isLoading: true,
        selectedRoles: [],
      };
    } else if (roles && roleAssignmentsData?.results?.length) {
      const selectedRoles: (PlatformRole & RemoveRole)[] = [];
      roles.results.forEach((platformRole) => {
        roleAssignmentsData.results.forEach((roleAssignment) => {
          if (roleAssignment.role_definition.toString() === platformRole.id.toString()) {
            selectedRoles.push({ ...platformRole, roleAssignmentId: roleAssignment.id });
          }
        });
      });
      return {
        isLoading: false,
        selectedRoles,
      };
    }
    return {
      isLoading: false,
      selectedRoles: [],
    };
  }, [roles, roleAssignmentsData?.results, isLoadingRoleAssignments, isLoadingRoles]);
}
