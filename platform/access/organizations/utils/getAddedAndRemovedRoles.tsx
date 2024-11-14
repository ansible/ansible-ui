import { AwxRbacRole } from '@ansible/awx-ui/interfaces/AwxRbacRole';
import { EdaRbacRole } from '@ansible/eda-ui/interfaces/EdaRbacRole';

export function getAddedAndRemovedRoles(
  originalRoles: (EdaRbacRole | AwxRbacRole)[],
  updatedRoles: (EdaRbacRole | AwxRbacRole)[]
) {
  const addedRoles: (
    | (EdaRbacRole & { remove?: boolean })
    | (AwxRbacRole & { remove?: boolean })
  )[] = [];
  const removedRoles: (
    | (EdaRbacRole & { remove?: boolean })
    | (AwxRbacRole & { remove?: boolean })
  )[] = [];
  originalRoles.forEach((origRole) => {
    if (
      !updatedRoles.some((updatedRole) => updatedRole.id === origRole.id) &&
      !removedRoles.some((removedRole) => removedRole.id === origRole.id)
    ) {
      removedRoles.push({ ...origRole, remove: true });
    }
  });
  updatedRoles.forEach((updatedRole) => {
    if (
      !originalRoles.some((origRole) => origRole.id === updatedRole.id) &&
      !addedRoles.some((addedRole) => addedRole.id === updatedRole.id)
    ) {
      addedRoles.push(updatedRole);
    }
  });
  return [...addedRoles, ...removedRoles];
}
