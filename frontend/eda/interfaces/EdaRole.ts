export enum ResourceTypeEnum {
  Activation = 'activation',
  ActivationInstance = 'activation_instance',
  AuditRule = 'audit_rule',
  AuditEvent = 'audit_event',
  Task = 'task',
  User = 'user',
  Project = 'project',
  Inventory = 'inventory',
  ExtraVar = 'extra_var',
  Rulebook = 'rulebook',
  Role = 'role',
  DecisionEnvironment = 'decision_environment',
  Credential = 'credential',
}

export interface PermissionRef {
  resource_type: ResourceTypeEnum;
  action: ActionEnum;
}

export enum ActionEnum {
  Create = 'create',
  Read = 'read',
  Update = 'update',
  Delete = 'delete',
  Enable = 'enable',
  Disable = 'disable',
  Restart = 'restart',
}

export interface RoleDetail {
  /**
   * Unique UUID of the role
   * @format uuid
   */
  id: string;
  /** Name of the rulebook */
  name: string;
  /**
   * Description of the rulebook
   * @default ""
   */
  description?: string | null;
  permissions: PermissionRef[];
  /**
   * The created_at timestamp of the ruleset
   * @format date-time
   */
  created_at: string;
  /**
   * The modified_at timestamp of the ruleset
   * @format date-time
   */
  modified_at: string;
}

export interface RoleList {
  /**
   * Unique UUID of the role
   * @format uuid
   */
  id: string;
  /** Name of the rulebook */
  name: string;
  /**
   * Description of the rulebook
   * @default ""
   */
  description?: string | null;
}

export interface RoleRef {
  /** @format uuid */
  id: string;
  name: string;
}

export type EdaRole = Omit<RoleDetail, 'permissions'> & {
  // HACK UNTIL EDA FIXES SWAGGER
  permissions: (Omit<PermissionRef, 'action'> & { action: ActionEnum[] })[];
};

export type EdaRoleRef = RoleRef;
