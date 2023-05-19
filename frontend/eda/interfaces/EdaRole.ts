import { ActionEnum, PermissionRef, RoleDetail, RoleRef } from './generated/eda-api';

export type EdaRole = Omit<RoleDetail, 'permissions'> & {
  permissions: (Omit<PermissionRef, 'action'> & { action: ActionEnum[] })[];
};

export type EdaRoleRef = RoleRef;
