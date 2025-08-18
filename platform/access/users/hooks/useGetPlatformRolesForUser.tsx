import { UserAssignment } from '@ansible/common-ui/access/interfaces/UserAssignment';
import { useGet } from '@ansible/common-ui/crud/useGet';
import { useMemo } from 'react';
import { gatewayAPI } from '../../../utils/gateway-api-utils';
import { PlatformRole } from '../../../interfaces/PlatformRole';

interface RemoveRole {
  remove?: boolean;
  roleAssignmentId?: number;
}

export function useGetPlatformRolesForUser(
  resource_type: string,
  resourceId: string,
  userId: string
) {
  const gatewayApiUrl = gatewayAPI`/role_user_assignments/?user=${userId}&object_id=${resourceId}`;
  const { data: roleAssignmentsData, isLoading: isLoadingRoleAssignments } = useGet<{
    results: UserAssignment[];
  }>(gatewayApiUrl);
  const { data: roles, isLoading: isLoadingRoles } = useGet<{ results: PlatformRole[] }>(
    gatewayAPI`/role_definitions/?content_type__api_slug=${resource_type}`
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
