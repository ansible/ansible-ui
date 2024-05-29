import { PlatformOrganization } from '../../../interfaces/PlatformOrganization';
import { useGatewayService } from '../../../main/GatewayServices';
import { useGet } from '../../../../frontend/common/crud/useGet';
import { PlatformUser } from '../../../interfaces/PlatformUser';
import { useEdaResource } from '../../../hooks/useEdaResource';
import { EdaUser } from '../../../../frontend/eda/interfaces/EdaUser';
import { EdaOrganization } from '../../../../frontend/eda/interfaces/EdaOrganization';
import { edaAPI } from '../../../../frontend/eda/common/eda-utils';
import { UserAssignment } from '../../../../frontend/common/access/interfaces/UserAssignment';
import { EdaRbacRole } from '../../../../frontend/eda/interfaces/EdaRbacRole';
import { useMemo } from 'react';

interface RemoveRole {
  remove?: boolean;
  roleAssignmentId?: number;
}

export function useGetEdaOrganizationRolesForUser(
  platformOrg?: PlatformOrganization,
  platformUser?: PlatformUser
) {
  const edaService = useGatewayService('eda');
  const { resource: edaUser, isLoading: isLoadingEdaUser } = useEdaResource<EdaUser>(
    'users/',
    platformUser
  );
  const { resource: edaOrganization, isLoading: isLoadingEdaOrganization } =
    useEdaResource<EdaOrganization>('organizations/', platformOrg);

  const edaApiUrl = edaAPI`/role_user_assignments/?user_id=${edaUser?.id.toString() ?? ''}&object_id=${edaOrganization?.id.toString() ?? ''}`;
  const { data: edaRoleAssignmentsData, isLoading: isLoadingEdaRoleAssignments } = useGet<{
    results: UserAssignment[];
  }>(edaApiUrl);

  const { data: edaRoles, isLoading: isLoadingEdaRoles } = useGet<{ results: EdaRbacRole[] }>(
    edaAPI`/role_definitions/?content_type__model=organization`
  );

  return useMemo(() => {
    if (!edaService) {
      return {
        isLoading: false,
        selectedRoles: [],
      };
    }
    if (
      isLoadingEdaUser ||
      isLoadingEdaOrganization ||
      isLoadingEdaRoleAssignments ||
      isLoadingEdaRoles
    ) {
      return {
        isLoading: true,
        selectedRoles: [],
      };
    } else if (edaRoles && edaRoleAssignmentsData?.results?.length) {
      const selectedRoles: (EdaRbacRole & RemoveRole)[] = [];
      edaRoles.results.forEach((edaRole) => {
        edaRoleAssignmentsData.results.forEach((edaRoleAssignment) => {
          if (edaRoleAssignment.role_definition.toString() === edaRole.id.toString()) {
            selectedRoles.push({ ...edaRole, roleAssignmentId: edaRoleAssignment.id });
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
    edaRoleAssignmentsData?.results,
    edaRoles,
    edaService,
    isLoadingEdaOrganization,
    isLoadingEdaRoleAssignments,
    isLoadingEdaRoles,
    isLoadingEdaUser,
  ]);
}
