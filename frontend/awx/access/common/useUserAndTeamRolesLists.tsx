import { useEffect } from 'react';
import { AccessRole, User } from '../../interfaces/User';

type Access = {
  descendant_roles: string[];
  role: AccessRole;
};

/**
 * Contruct the user_roles and team_roles lists for a user based on their access
 */
export function useUserAndTeamRolesLists(users: User[]) {
  useEffect(() => {
    function sortRoles(access: Access, user: User) {
      const { role } = access;
      if (role.team_id) {
        user.team_roles?.push(role);
      } else {
        user.user_roles?.push(role);
      }
    }

    if (users?.length > 0) {
      for (const user of users) {
        user.team_roles = [];
        user.user_roles = [];
        user.summary_fields?.direct_access?.forEach((access) => sortRoles(access, user));
        user.summary_fields?.indirect_access?.forEach((access) => sortRoles(access, user));
      }
    }
  }, [users]);
}
