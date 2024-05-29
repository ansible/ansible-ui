import { useGatewayService } from '../../../main/GatewayServices';
import { PlatformOrganization } from '../../../interfaces/PlatformOrganization';
import { useGet } from '../../../../frontend/common/crud/useGet';
import { useAwxResource } from '../../../hooks/useAwxResource';
import { Organization } from '../../../../frontend/awx/interfaces/Organization';
import { AwxUser } from '../../../../frontend/awx/interfaces/User';
import { PlatformUser } from '../../../interfaces/PlatformUser';
import { awxAPI } from '../../../../frontend/awx/common/api/awx-utils';
import { UserAssignment } from '../../../../frontend/common/access/interfaces/UserAssignment';
import { AwxRbacRole } from '../../../../frontend/awx/interfaces/AwxRbacRole';
import { useMemo } from 'react';

interface RemoveRole {
  remove?: boolean;
  roleAssignmentId?: number;
}

export function useGetAwxOrganizationRolesForUser(
  platformOrg?: PlatformOrganization,
  platformUser?: PlatformUser
) {
  const awxService = useGatewayService('controller');
  const { resource: awxUser, isLoading: isLoadingAwxUser } = useAwxResource<AwxUser>(
    '/users/',
    platformUser
  );
  const { resource: awxOrganization, isLoading: isLoadingAwxOrg } = useAwxResource<Organization>(
    '/organizations/',
    platformOrg
  );
  const awxApiUrl = awxAPI`/role_user_assignments/?user_id=${awxUser?.id.toString() ?? ''}&object_id=${awxOrganization?.id.toString() ?? ''}`;
  const { data: awxRoleAssignmentsData, isLoading: isLoadingAwxRoleAssignments } = useGet<{
    results: UserAssignment[];
  }>(awxApiUrl);
  const { data: awxRoles, isLoading: isLoadingAwxRoles } = useGet<{ results: AwxRbacRole[] }>(
    awxAPI`/role_definitions/?content_type__model=organization`
  );

  return useMemo(() => {
    if (!awxService) {
      return {
        isLoading: false,
        selectedRoles: [],
      };
    }
    if (isLoadingAwxUser || isLoadingAwxOrg || isLoadingAwxRoleAssignments || isLoadingAwxRoles) {
      return {
        isLoading: true,
        selectedRoles: [],
      };
    } else if (awxRoles && awxRoleAssignmentsData?.results?.length) {
      const selectedRoles: (AwxRbacRole & RemoveRole)[] = [];
      awxRoles.results.forEach((awxRole) => {
        awxRoleAssignmentsData.results.forEach((awxRoleAssignment) => {
          if (awxRoleAssignment.role_definition.toString() === awxRole.id.toString()) {
            selectedRoles.push({ ...awxRole, roleAssignmentId: awxRoleAssignment.id });
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
  }, [
    awxRoleAssignmentsData?.results,
    awxRoles,
    awxService,
    isLoadingAwxOrg,
    isLoadingAwxRoleAssignments,
    isLoadingAwxRoles,
    isLoadingAwxUser,
  ]);
}
