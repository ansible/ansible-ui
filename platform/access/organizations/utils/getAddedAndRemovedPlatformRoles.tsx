import { PlatformRbacRole } from '../../../interfaces/PlatformRbacRole';

export function getAddedAndRemovedPlatformRoles(
  originalRoles: PlatformRbacRole[],
  updatedRoles: PlatformRbacRole[]
) {
  const addedRoles: (PlatformRbacRole & { remove?: boolean })[] = [];
  const removedRoles: (PlatformRbacRole & { remove?: boolean })[] = [];
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
