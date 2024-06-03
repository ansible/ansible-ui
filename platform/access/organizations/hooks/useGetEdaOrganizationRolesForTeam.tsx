import { PlatformOrganization } from '../../../interfaces/PlatformOrganization';
import { useGatewayService } from '../../../main/GatewayServices';
import { useGet } from '../../../../frontend/common/crud/useGet';
import { PlatformTeam } from '../../../interfaces/PlatformTeam';
import { useEdaResource } from '../../../hooks/useEdaResource';
import { EdaOrganization } from '../../../../frontend/eda/interfaces/EdaOrganization';
import { edaAPI } from '../../../../frontend/eda/common/eda-utils';
import { EdaRbacRole } from '../../../../frontend/eda/interfaces/EdaRbacRole';
import { useMemo } from 'react';
import { EdaTeam } from '../../../../frontend/eda/interfaces/EdaTeam';
import { TeamAssignment } from '../../../../frontend/common/access/interfaces/TeamAssignment';

interface RemoveRole {
  remove?: boolean;
  roleAssignmentId?: number;
}

export function useGetEdaOrganizationRolesForTeam(
  platformOrg?: PlatformOrganization,
  platformTeam?: PlatformTeam
) {
  const edaService = useGatewayService('eda');
  const { resource: edaTeam, isLoading: isLoadingEdaTeam } = useEdaResource<EdaTeam>(
    'teams/',
    platformTeam
  );
  const { resource: edaOrganization, isLoading: isLoadingEdaOrganization } =
    useEdaResource<EdaOrganization>('organizations/', platformOrg);

  const edaApiUrl = edaAPI`/role_team_assignments/?team_id=${edaTeam?.id.toString() ?? ''}&object_id=${edaOrganization?.id.toString() ?? ''}`;
  const { data: edaRoleAssignmentsData, isLoading: isLoadingEdaRoleAssignments } = useGet<{
    results: TeamAssignment[];
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
      isLoadingEdaTeam ||
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
    isLoadingEdaTeam,
  ]);
}
