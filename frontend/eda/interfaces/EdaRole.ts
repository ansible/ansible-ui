import { ActionEnum, PermissionRef, RoleDetail, RoleRef } from './generated/eda-api';

export type EdaRole = Omit<RoleDetail, 'permissions'> & {
  // HACK UNTIL EDA FIXES SWAGGER
  permissions: (Omit<PermissionRef, 'action'> & { action: ActionEnum[] })[];
};

export type EdaRoleRef = RoleRef;
