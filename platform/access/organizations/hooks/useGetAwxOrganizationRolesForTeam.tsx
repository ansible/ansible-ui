import { useGatewayService } from '../../../main/GatewayServices';
import { PlatformOrganization } from '../../../interfaces/PlatformOrganization';
import { useGet } from '../../../../frontend/common/crud/useGet';
import { useAwxResource } from '../../../hooks/useAwxResource';
import { Organization } from '../../../../frontend/awx/interfaces/Organization';
import { awxAPI } from '../../../../frontend/awx/common/api/awx-utils';
import { AwxRbacRole } from '../../../../frontend/awx/interfaces/AwxRbacRole';
import { useMemo } from 'react';
import { PlatformTeam } from '../../../interfaces/PlatformTeam';
import { TeamAssignment } from '../../../../frontend/common/access/interfaces/TeamAssignment';
import { Team } from '../../../../frontend/awx/interfaces/Team';

interface RemoveRole {
  remove?: boolean;
  roleAssignmentId?: number;
}

export function useGetAwxOrganizationRolesForTeam(
  platformOrg?: PlatformOrganization,
  platformTeam?: PlatformTeam
) {
  const awxService = useGatewayService('controller');
  const { resource: awxTeam, isLoading: isLoadingAwxTeam } = useAwxResource<Team>(
    '/teams/',
    platformTeam
  );
  const { resource: awxOrganization, isLoading: isLoadingAwxOrg } = useAwxResource<Organization>(
    '/organizations/',
    platformOrg
  );
  const awxApiUrl = awxAPI`/role_team_assignments/?team_id=${awxTeam?.id.toString() ?? ''}&object_id=${awxOrganization?.id.toString() ?? ''}`;
  const { data: awxRoleAssignmentsData, isLoading: isLoadingAwxRoleAssignments } = useGet<{
    results: TeamAssignment[];
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
    if (isLoadingAwxTeam || isLoadingAwxOrg || isLoadingAwxRoleAssignments || isLoadingAwxRoles) {
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
    isLoadingAwxTeam,
  ]);
}
