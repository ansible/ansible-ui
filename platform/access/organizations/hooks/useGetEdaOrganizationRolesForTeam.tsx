import { TeamAssignment } from '@ansible/common-ui/access/interfaces/TeamAssignment';
import { useGet } from '@ansible/common-ui/crud/useGet';
import { edaAPI } from '@ansible/eda-ui/common/eda-utils';
import { EdaOrganization } from '@ansible/eda-ui/interfaces/EdaOrganization';
import { EdaRbacRole } from '@ansible/eda-ui/interfaces/EdaRbacRole';
import { EdaTeam } from '@ansible/eda-ui/interfaces/EdaTeam';
import { useMemo } from 'react';
import { useEdaResource } from '../../../hooks/useEdaResource';
import { PlatformOrganization } from '../../../interfaces/PlatformOrganization';
import { PlatformTeam } from '../../../interfaces/PlatformTeam';
import { useGatewayService } from '../../../main/GatewayServices';

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
