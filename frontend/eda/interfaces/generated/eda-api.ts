/* eslint-disable */
/* eslint-disable */
/* tslint:disable */
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

/**
 * * `create` - create
 * * `read` - read
 * * `update` - update
 * * `delete` - delete
 * * `enable` - enable
 * * `disable` - disable
 * * `restart` - restart
 */
export enum ActionEnum {
  Create = 'create',
  Read = 'read',
  Update = 'update',
  Delete = 'delete',
  Enable = 'enable',
  Disable = 'disable',
  Restart = 'restart',
}

/** Serializer for creating the Activation. */
export interface ActivationCreate {
  name: string;
  description?: string;
  is_enabled?: boolean;
  decision_environment_id: number;
  sources?: [];
  rulebook_id: number;
  extra_var_id?: number | null;
  /**
   * * `always` - always
   * * `on-failure` - on-failure
   * * `never` - never
   */
  restart_policy?: RestartPolicyEnum;
  log_level: LogLevelEnum;
}

/** Serializer for the Activation Instance model. */
export interface ActivationInstance {
  id: number;
  name?: string;
  /**
   * * `starting` - starting
   * * `running` - running
   * * `pending` - pending
   * * `failed` - failed
   * * `stopping` - stopping
   * * `stopped` - stopped
   * * `deleting` - deleting
   * * `completed` - completed
   * * `unresponsive` - unresponsive
   * * `error` - error
   */
  status?: Status906Enum;
  git_hash?: string;
  status_message?: string | null;
  activation_id: number;
  /** @format date-time */
  started_at: string;
  /** @format date-time */
  ended_at: string | null;
}

/** Serializer for the Activation Instance Log model. */
export interface ActivationInstanceLog {
  id: number;
  /**
   * @min -2147483648
   * @max 2147483647
   */
  line_number: number;
  log: string;
  activation_instance: number;
}

/** Serializer for listing the Activation model objects. */
export interface ActivationList {
  id: number;
  name: string;
  description?: string;
  is_enabled?: boolean;
  /**
   * * `starting` - starting
   * * `running` - running
   * * `pending` - pending
   * * `failed` - failed
   * * `stopping` - stopping
   * * `stopped` - stopped
   * * `deleting` - deleting
   * * `completed` - completed
   * * `unresponsive` - unresponsive
   * * `error` - error
   */
  status?: Status906Enum;
  decision_environment_id: number | null;
  project_id: number | null;
  rulebook_id: number | null;
  extra_var_id: number | null;
  /**
   * * `always` - always
   * * `on-failure` - on-failure
   * * `never` - never
   */
  restart_policy?: RestartPolicyEnum;
  /**
   * @min -2147483648
   * @max 2147483647
   */
  restart_count?: number;
  /** Name of the referenced rulebook */
  rulebook_name: string;
  current_job_id?: string | null;
  rules_count: number;
  rules_fired_count: number;
  /** @format date-time */
  created_at: string;
  /** @format date-time */
  modified_at: string;
  status_message?: string | null;
}

export interface SourceRef {
  id: string;
  name: string;
}

/** Serializer for reading the Activation with related objects info. */
export interface ActivationRead {
  id: number;
  name: string;
  description?: string;
  is_enabled?: boolean;
  decision_environment?: DecisionEnvironmentRef | null;
  event_streams?: EventStreamRef[];
  credentials?: CredentialRef[];

  /**
   * * `starting` - starting
   * * `running` - running
   * * `pending` - pending
   * * `failed` - failed
   * * `stopping` - stopping
   * * `stopped` - stopped
   * * `deleting` - deleting
   * * `completed` - completed
   * * `unresponsive` - unresponsive
   * * `error` - error
   */
  status?: Status906Enum;
  git_hash?: string;
  project?: ProjectRef | null;
  rulebook?: RulebookRef | null;
  extra_var?: ExtraVarRef | null;
  instances: ActivationInstance[];
  /**
   * * `always` - always
   * * `on-failure` - on-failure
   * * `never` - never
   */
  restart_policy?: RestartPolicyEnum;
  /**
   * @min -2147483648
   * @max 2147483647
   */
  log_level: LogLevelEnum;
  restart_count?: number;
  /** Name of the referenced rulebook */
  rulebook_name: string;
  current_job_id?: string | null;
  rules_count: number;
  rules_fired_count: number;
  /** @format date-time */
  created_at: string;
  /** @format date-time */
  modified_at: string;
  /** @format date-time */
  restarted_at?: string | null;
  status_message?: string | null;
}

export interface AuditAction {
  /**
   * UUID of the triggered action
   * @format uuid
   */
  id: string;
  /** Name of the action */
  name: string;
  /** Status of the action */
  status?: string;
  /**
   * The URL in the action
   * @format uri
   */
  url?: string;
  /**
   * The fired timestamp of the action
   * @format date-time
   */
  fired_at: string;
  /** @format date-time */
  rule_fired_at?: string | null;
  audit_rule_id: number | null;
}

export interface AuditEvent {
  /**
   * UUID of the triggered event
   * @format uuid
   */
  id: string;
  /** Name of the source */
  source_name: string;
  /** Type of the source */
  source_type: string;
  /**
   * The received timestamp of the event
   * @format date-time
   */
  received_at: string;
  /** The payload in the event */
  payload?: Record<string, any>;
  /** @format date-time */
  rule_fired_at?: string | null;
  audit_actions: string[];
}

export interface AuditRuleDetail {
  /** ID of the fired rule */
  id: number;
  /** Name of the fired rule */
  name: string;
  /** Status of the fired rule */
  status?: string;
  /** @example {"id":0,"name":"string"} */
  activation_instance: {
    id?: number | null;
    name?: string;
  };
  /** Name of the related ruleset */
  ruleset_name?: string;
  /**
   * The created timestamp of the action
   * @format date-time
   */
  created_at: string;
  /**
   * The fired timestamp of the rule
   * @format date-time
   */
  fired_at: string;
}

export interface AuditRuleList {
  /** ID of the fired rule */
  id: number;
  /** Name of the fired rule */
  name: string;
  /** Status of the fired rule */
  status?: string;
  /** @example {"id":0,"name":"string"} */
  activation_instance: {
    id?: number | null;
    name?: string;
  };
  /**
   * The fired timestamp of the rule
   * @format date-time
   */
  fired_at: string;
}

export interface AwxToken {
  id: number;
  name: string;
  description?: string;
  user_id: number;
  /** @format date-time */
  created_at: string;
  /** @format date-time */
  modified_at: string;
}

export interface AwxTokenCreate {
  name: string;
  description?: string;
  token: string;
}

export interface Credential {
  name: string;
  description?: string;
  username?: string | null;
  key?: string | null;
  /**
   * * `Container Registry` - Container Registry
   * * `GitHub Personal Access Token` - GitHub Personal Access Token
   * * `GitLab Personal Access Token` - GitLab Personal Access Token
   * * `Vault` - Vault
   */
  credential_type?: CredentialTypeEnum;
  id: number;
  /** @format date-time */
  created_at: string;
  /** @format date-time */
  modified_at: string;
}

export interface CredentialCreate {
  name: string;
  description?: string;
  /**
   * * `Container Registry` - Container Registry
   * * `GitHub Personal Access Token` - GitHub Personal Access Token
   * * `GitLab Personal Access Token` - GitLab Personal Access Token
   * * `Vault` - Vault
   */
  credential_type?: CredentialTypeEnum;
  username?: string | null;
  key?: string | null;
  secret?: string | null;
}

/** Serializer for Credential reference. */
export interface CredentialRef {
  id: number;
  name: string;
  description?: string;
  /**
   * * `Container Registry` - Container Registry
   * * `GitHub Personal Access Token` - GitHub Personal Access Token
   * * `GitLab Personal Access Token` - GitLab Personal Access Token
   */
  credential_type?: CredentialTypeEnum;
  username?: string | null;
}

/**
 * * `Container Registry` - Container Registry
 * * `GitHub Personal Access Token` - GitHub Personal Access Token
 * * `GitLab Personal Access Token` - GitLab Personal Access Token
 * * `Extra Vars` - Extra Vars
 * * `Ansible Vault Password` - Ansible Vault Password
 */
export enum CredentialTypeEnum {
  ContainerRegistry = 'Container Registry',
  GitHubPersonalAccessToken = 'GitHub Personal Access Token',
  GitLabPersonalAccessToken = 'GitLab Personal Access Token',
  AnsibleVaultPassword = 'Vault',
}

export interface DecisionEnvironment {
  name: string;
  description?: string;
  image_url: string;
  credential_id: number | null;
  id: number;
  /** @format date-time */
  created_at: string;
  /** @format date-time */
  modified_at: string;
}

/** Serializer for creating the DecisionEnvironment. */
export interface DecisionEnvironmentCreate {
  name: string;
  description?: string;
  image_url: string;
  credential_id?: number | null;
}

/** Serializer for reading the DecisionEnvironment with embedded objects. */
export interface DecisionEnvironmentRead {
  id: number;
  name: string;
  description?: string;
  image_url: string;
  credential?: CredentialRef | null;
  /** @format date-time */
  created_at: string;
  /** @format date-time */
  modified_at: string;
}

/** Serializer for DecisionEnvironment reference. */
export interface DecisionEnvironmentRef {
  id: number;
  name: string;
  description?: string;
  image_url: string;
}

export interface ExtraVar {
  id: number;
  /** Content of the extra_var */
  extra_var: string;
}

export interface ExtraVarCreate {
  /** Content of the extra_var */
  extra_var: string;
}

/** Serializer for Extra Var reference. */
export interface ExtraVarRef {
  id: number;
}

/**
 * * `pending` - Pending
 * * `running` - Running
 * * `failed` - Failed
 * * `completed` - Completed
 */
export enum ImportStateEnum {
  Pending = 'pending',
  Running = 'running',
  Failed = 'failed',
  Completed = 'completed',
}

export interface Login {
  username: string;
  password: string;
}

export interface PaginatedActivationInstanceList {
  /** @example 123 */
  count?: number;
  /**
   * @format uri
   * @example "/eda/api/v1/example/?page=51&page_size=100"
   */
  next?: string | null;
  /**
   * @format uri
   * @example "/eda/api/v1/example/?page=49&page_size=100"
   */
  previous?: string | null;
  /** @example 100 */
  page_size?: number | null;
  /** @example 50 */
  page?: number | null;
  results?: ActivationInstance[];
}

export interface PaginatedActivationInstanceLogList {
  /** @example 123 */
  count?: number;
  /**
   * @format uri
   * @example "/eda/api/v1/example/?page=51&page_size=100"
   */
  next?: string | null;
  /**
   * @format uri
   * @example "/eda/api/v1/example/?page=49&page_size=100"
   */
  previous?: string | null;
  /** @example 100 */
  page_size?: number | null;
  /** @example 50 */
  page?: number | null;
  results?: ActivationInstanceLog[];
}

export interface PaginatedActivationListList {
  /** @example 123 */
  count?: number;
  /**
   * @format uri
   * @example "/eda/api/v1/example/?page=51&page_size=100"
   */
  next?: string | null;
  /**
   * @format uri
   * @example "/eda/api/v1/example/?page=49&page_size=100"
   */
  previous?: string | null;
  /** @example 100 */
  page_size?: number | null;
  /** @example 50 */
  page?: number | null;
  results?: ActivationList[];
}

export interface PaginatedAuditActionList {
  /** @example 123 */
  count?: number;
  /**
   * @format uri
   * @example "/eda/api/v1/example/?page=51&page_size=100"
   */
  next?: string | null;
  /**
   * @format uri
   * @example "/eda/api/v1/example/?page=49&page_size=100"
   */
  previous?: string | null;
  /** @example 100 */
  page_size?: number | null;
  /** @example 50 */
  page?: number | null;
  results?: AuditAction[];
}

export interface PaginatedAuditEventList {
  /** @example 123 */
  count?: number;
  /**
   * @format uri
   * @example "/eda/api/v1/example/?page=51&page_size=100"
   */
  next?: string | null;
  /**
   * @format uri
   * @example "/eda/api/v1/example/?page=49&page_size=100"
   */
  previous?: string | null;
  /** @example 100 */
  page_size?: number | null;
  /** @example 50 */
  page?: number | null;
  results?: AuditEvent[];
}

export interface PaginatedAuditRuleListList {
  /** @example 123 */
  count?: number;
  /**
   * @format uri
   * @example "/eda/api/v1/example/?page=51&page_size=100"
   */
  next?: string | null;
  /**
   * @format uri
   * @example "/eda/api/v1/example/?page=49&page_size=100"
   */
  previous?: string | null;
  /** @example 100 */
  page_size?: number | null;
  /** @example 50 */
  page?: number | null;
  results?: AuditRuleList[];
}

export interface PaginatedAwxTokenList {
  /** @example 123 */
  count?: number;
  /**
   * @format uri
   * @example "/eda/api/v1/example/?page=51&page_size=100"
   */
  next?: string | null;
  /**
   * @format uri
   * @example "/eda/api/v1/example/?page=49&page_size=100"
   */
  previous?: string | null;
  /** @example 100 */
  page_size?: number | null;
  /** @example 50 */
  page?: number | null;
  results?: AwxToken[];
}

export interface PaginatedCredentialList {
  /** @example 123 */
  count?: number;
  /**
   * @format uri
   * @example "/eda/api/v1/example/?page=51&page_size=100"
   */
  next?: string | null;
  /**
   * @format uri
   * @example "/eda/api/v1/example/?page=49&page_size=100"
   */
  previous?: string | null;
  /** @example 100 */
  page_size?: number | null;
  /** @example 50 */
  page?: number | null;
  results?: Credential[];
}

export interface PaginatedDecisionEnvironmentList {
  /** @example 123 */
  count?: number;
  /**
   * @format uri
   * @example "/eda/api/v1/example/?page=51&page_size=100"
   */
  next?: string | null;
  /**
   * @format uri
   * @example "/eda/api/v1/example/?page=49&page_size=100"
   */
  previous?: string | null;
  /** @example 100 */
  page_size?: number | null;
  /** @example 50 */
  page?: number | null;
  results?: DecisionEnvironment[];
}

export interface PaginatedExtraVarList {
  /** @example 123 */
  count?: number;
  /**
   * @format uri
   * @example "/eda/api/v1/example/?page=51&page_size=100"
   */
  next?: string | null;
  /**
   * @format uri
   * @example "/eda/api/v1/example/?page=49&page_size=100"
   */
  previous?: string | null;
  /** @example 100 */
  page_size?: number | null;
  /** @example 50 */
  page?: number | null;
  results?: ExtraVar[];
}

export interface PaginatedProjectList {
  /** @example 123 */
  count?: number;
  /**
   * @format uri
   * @example "/eda/api/v1/example/?page=51&page_size=100"
   */
  next?: string | null;
  /**
   * @format uri
   * @example "/eda/api/v1/example/?page=49&page_size=100"
   */
  previous?: string | null;
  /** @example 100 */
  page_size?: number | null;
  /** @example 50 */
  page?: number | null;
  results?: Project[];
}

export interface PaginatedRoleListList {
  /** @example 123 */
  count?: number;
  /**
   * @format uri
   * @example "/eda/api/v1/example/?page=51&page_size=100"
   */
  next?: string | null;
  /**
   * @format uri
   * @example "/eda/api/v1/example/?page=49&page_size=100"
   */
  previous?: string | null;
  /** @example 100 */
  page_size?: number | null;
  /** @example 50 */
  page?: number | null;
  results?: RoleList[];
}

export interface PaginatedRuleList {
  /** @example 123 */
  count?: number;
  /**
   * @format uri
   * @example "/eda/api/v1/example/?page=51&page_size=100"
   */
  next?: string | null;
  /**
   * @format uri
   * @example "/eda/api/v1/example/?page=49&page_size=100"
   */
  previous?: string | null;
  /** @example 100 */
  page_size?: number | null;
  /** @example 50 */
  page?: number | null;
  results?: Rule[];
}

export interface PaginatedRuleOutList {
  /** @example 123 */
  count?: number;
  /**
   * @format uri
   * @example "/eda/api/v1/example/?page=51&page_size=100"
   */
  next?: string | null;
  /**
   * @format uri
   * @example "/eda/api/v1/example/?page=49&page_size=100"
   */
  previous?: string | null;
  /** @example 100 */
  page_size?: number | null;
  /** @example 50 */
  page?: number | null;
  results?: RuleOut[];
}

export interface PaginatedRulebookList {
  /** @example 123 */
  count?: number;
  /**
   * @format uri
   * @example "/eda/api/v1/example/?page=51&page_size=100"
   */
  next?: string | null;
  /**
   * @format uri
   * @example "/eda/api/v1/example/?page=49&page_size=100"
   */
  previous?: string | null;
  /** @example 100 */
  page_size?: number | null;
  /** @example 50 */
  page?: number | null;
  results?: Rulebook[];
}

export interface PaginatedRulesetOutList {
  /** @example 123 */
  count?: number;
  /**
   * @format uri
   * @example "/eda/api/v1/example/?page=51&page_size=100"
   */
  next?: string | null;
  /**
   * @format uri
   * @example "/eda/api/v1/example/?page=49&page_size=100"
   */
  previous?: string | null;
  /** @example 100 */
  page_size?: number | null;
  /** @example 50 */
  page?: number | null;
  results?: RulesetOut[];
}

export interface PaginatedUserListList {
  /** @example 123 */
  count?: number;
  /**
   * @format uri
   * @example "/eda/api/v1/example/?page=51&page_size=100"
   */
  next?: string | null;
  /**
   * @format uri
   * @example "/eda/api/v1/example/?page=49&page_size=100"
   */
  previous?: string | null;
  /** @example 100 */
  page_size?: number | null;
  /** @example 50 */
  page?: number | null;
  results?: UserList[];
}

export interface PatchedCredentialCreate {
  name?: string;
  description?: string;
  /**
   * * `Container Registry` - Container Registry
   * * `GitHub Personal Access Token` - GitHub Personal Access Token
   * * `GitLab Personal Access Token` - GitLab Personal Access Token
   */
  credential_type?: CredentialTypeEnum;
  username?: string | null;
  secret?: string | null;
}

export interface PatchedCurrentUserUpdate {
  /** @maxLength 150 */
  first_name?: string;
  /** @maxLength 150 */
  last_name?: string;
  /**
   * Email address
   * @format email
   * @maxLength 254
   */
  email?: string;
  password?: string;
}

/** Serializer for creating the DecisionEnvironment. */
export interface PatchedDecisionEnvironmentCreate {
  name?: string;
  description?: string;
  image_url?: string;
  credential_id?: number | null;
}

export interface PatchedProjectUpdateRequest {
  /** Name of the project */
  name?: string;
  /** Description of the project */
  description?: string | null;
  /** Credential id of the project */
  credential_id?: number | null;
  /** Indicates if SSL verification is enabled */
  verify_ssl?: boolean;
}

export interface PatchedUserCreateUpdate {
  /** The user's log in name. */
  username?: string;
  /** @maxLength 150 */
  first_name?: string;
  /** @maxLength 150 */
  last_name?: string;
  /**
   * Email address
   * @format email
   * @maxLength 254
   */
  email?: string;
  password?: string;
  roles?: string[];
}

export interface PermissionRef {
  resource_type: ResourceTypeEnum;
  action: ActionEnum;
}

export interface Project {
  name: string;
  description?: string;
  credential_id?: number | null;
  verify_ssl?: boolean;
  id: number;
  url: string;
  git_hash: string;
  import_state: ImportStateEnum;
  import_error: string | null;
  /** @format uuid */
  import_task_id: string | null;
  /** @format date-time */
  created_at: string;
  /** @format date-time */
  modified_at: string;
}

export interface ProjectCreateRequest {
  url: string;
  name: string;
  description?: string;
  credential_id?: number | null;
  verify_ssl?: boolean;
}

/** Serializer for reading the Project with embedded objects. */
export interface ProjectRead {
  name: string;
  description?: string;
  credential?: CredentialRef | null;
  verify_ssl?: boolean;
  id: number;
  url: string;
  git_hash: string;
  import_state: ImportStateEnum;
  import_error: string | null;
  /** @format uuid */
  import_task_id: string | null;
  /** @format date-time */
  created_at: string;
  /** @format date-time */
  modified_at: string;
}

export interface ProjectRef {
  id: number;
  git_hash: string;
  url: string;
  name: string;
  description?: string;
}

/**
 * * `activation` - activation
 * * `activation_instance` - activation_instance
 * * `audit_rule` - audit_rule
 * * `audit_event` - audit_event
 * * `task` - task
 * * `user` - user
 * * `project` - project
 * * `inventory` - inventory
 * * `extra_var` - extra_var
 * * `rulebook` - rulebook
 * * `role` - role
 * * `decision_environment` - decision_environment
 * * `credential` - credential
 */
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

/**
 * * `always` - always
 * * `on-failure` - on-failure
 * * `never` - never
 */
export enum RestartPolicyEnum {
  Always = 'always',
  OnFailure = 'on-failure',
  Never = 'never',
}
export enum LogLevelEnum {
  error = 'error',
  info = 'info',
  debug = 'debug',
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

export interface Rule {
  id: number;
  /** Name of the rule */
  name: string;
  /** The action in the rule */
  action: Record<string, any>;
  ruleset_id: number | null;
}

export interface RuleOut {
  /** ID of the ruleset */
  id: number;
  /** Name of the rule */
  name: string;
  /** The action in the rule */
  action?: Record<string, any>;
  /** List of stats */
  fired_stats: Record<string, any>[];
  /** ID of the rulebook */
  rulebook_id?: number | null;
  /** ID of the ruleset */
  ruleset_id?: number | null;
  /** ID of the project */
  project_id?: number | null;
}

export interface Rulebook {
  id: number;
  name: string;
  description?: string | null;
  rulesets?: string;
  /** ID of the project */
  project_id?: number | null;
  /** @format date-time */
  created_at: string;
  /** @format date-time */
  modified_at: string;
}

/** Serializer for Rulebook reference. */
export interface RulebookRef {
  id: number;
  name: string;
  description?: string | null;
}

export interface RulesetOut {
  /** ID of the ruleset */
  id: number;
  /** Name of the ruleset */
  name: string;
  /** Number of rules the ruleset contains */
  rule_count: number;
  /** List of source types */
  source_types: string[];
  /** List of stats */
  fired_stats: Record<string, any>[];
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

/**
 * * `starting` - starting
 * * `running` - running
 * * `pending` - pending
 * * `failed` - failed
 * * `stopping` - stopping
 * * `stopped` - stopped
 * * `deleting` - deleting
 * * `completed` - completed
 * * `unresponsive` - unresponsive
 * * `error` - error
 */
export enum Status906Enum {
  Starting = 'starting',
  Running = 'running',
  Pending = 'pending',
  Failed = 'failed',
  Stopping = 'stopping',
  Stopped = 'stopped',
  Deleting = 'deleting',
  Completed = 'completed',
  Unresponsive = 'unresponsive',
  Error = 'error',
}

export interface Task {
  /** @format uuid */
  id: string;
  status: TaskStatusEnum;
  /** @format date-time */
  created_at: string | null;
  /** @format date-time */
  enqueued_at: string | null;
  /** @format date-time */
  started_at: string | null;
  /** @format date-time */
  finished_at: string | null;
  result: Record<string, any>;
}

/**
 * * `queued` - queued
 * * `finished` - finished
 * * `failed` - failed
 * * `started` - started
 * * `deferred` - deferred
 * * `scheduled` - scheduled
 * * `stopped` - stopped
 * * `canceled` - canceled
 */
export enum TaskStatusEnum {
  Queued = 'queued',
  Finished = 'finished',
  Failed = 'failed',
  Started = 'started',
  Deferred = 'deferred',
  Scheduled = 'scheduled',
  Stopped = 'stopped',
  Canceled = 'canceled',
}

export interface UserCreateUpdate {
  /** The user's log in name. */
  username: string;
  /** @maxLength 150 */
  first_name?: string;
  /** @maxLength 150 */
  last_name?: string;
  /**
   * Email address
   * @format email
   * @maxLength 254
   */
  email?: string;
  password: string;
  roles: string[];
}

export interface UserDetail {
  id: number;
  /** The user's log in name. */
  username: string;
  /**
   * Email address
   * @format email
   * @maxLength 254
   */
  email?: string;
  /** @maxLength 150 */
  first_name?: string;
  /** @maxLength 150 */
  last_name?: string;
  /**
   * Superuser status
   * Designates that this user has all permissions without explicitly assigning them.
   */
  is_superuser?: boolean;
  roles: RoleRef[];
  /** @format date-time */
  created_at: string;
  /** @format date-time */
  modified_at: string;
}

export interface UserList {
  /** The ID of the user */
  id: number;
  /** The user's log in name. */
  username: string;
  /** The user's first name. */
  first_name: string;
  /** The user's last name. */
  last_name: string;
  /** The user is a superuser. */
  is_superuser: boolean;
  roles: RoleRef[];
}

export type QueryParamsType = Record<string | number, any>;
export type ResponseFormat = keyof Omit<Body, 'body' | 'bodyUsed'>;

export interface FullRequestParams extends Omit<RequestInit, 'body'> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseFormat;
  /** request body */
  body?: unknown;
  /** base url */
  baseUrl?: string;
  /** request cancellation token */
  cancelToken?: CancelToken;
}

export type RequestParams = Omit<FullRequestParams, 'body' | 'method' | 'query' | 'path'>;

export interface ApiConfig<SecurityDataType = unknown> {
  baseUrl?: string;
  baseApiParams?: Omit<RequestParams, 'baseUrl' | 'cancelToken' | 'signal'>;
  securityWorker?: (
    securityData: SecurityDataType | null
  ) => Promise<RequestParams | void> | RequestParams | void;
  customFetch?: typeof fetch;
}

export interface HttpResponse<D extends unknown, E extends unknown = unknown> extends Response {
  data: D;
  error: E;
}

type CancelToken = Symbol | string | number;

export enum ContentType {
  Json = 'application/json',
  FormData = 'multipart/form-data',
  UrlEncoded = 'application/x-www-form-urlencoded',
  Text = 'text/plain',
}

export class HttpClient<SecurityDataType = unknown> {
  public baseUrl: string = '/api/eda/v1';
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>['securityWorker'];
  private abortControllers = new Map<CancelToken, AbortController>();
  private customFetch = (...fetchParams: Parameters<typeof fetch>) => fetch(...fetchParams);

  private baseApiParams: RequestParams = {
    credentials: 'same-origin',
    headers: {},
    redirect: 'follow',
    referrerPolicy: 'no-referrer',
  };

  constructor(apiConfig: ApiConfig<SecurityDataType> = {}) {
    Object.assign(this, apiConfig);
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  protected encodeQueryParam(key: string, value: any) {
    const encodedKey = encodeURIComponent(key);
    return `${encodedKey}=${encodeURIComponent(typeof value === 'number' ? value : `${value}`)}`;
  }

  protected addQueryParam(query: QueryParamsType, key: string) {
    return this.encodeQueryParam(key, query[key]);
  }

  protected addArrayQueryParam(query: QueryParamsType, key: string) {
    const value = query[key];
    return value.map((v: any) => this.encodeQueryParam(key, v)).join('&');
  }

  protected toQueryString(rawQuery?: QueryParamsType): string {
    const query = rawQuery || {};
    const keys = Object.keys(query).filter((key) => 'undefined' !== typeof query[key]);
    return keys
      .map((key) =>
        Array.isArray(query[key])
          ? this.addArrayQueryParam(query, key)
          : this.addQueryParam(query, key)
      )
      .join('&');
  }

  protected addQueryParams(rawQuery?: QueryParamsType): string {
    const queryString = this.toQueryString(rawQuery);
    return queryString ? `?${queryString}` : '';
  }

  private contentFormatters: Record<ContentType, (input: any) => any> = {
    [ContentType.Json]: (input: any) =>
      input !== null && (typeof input === 'object' || typeof input === 'string')
        ? JSON.stringify(input)
        : input,
    [ContentType.Text]: (input: any) =>
      input !== null && typeof input !== 'string' ? JSON.stringify(input) : input,
    [ContentType.FormData]: (input: any) =>
      Object.keys(input || {}).reduce((formData, key) => {
        const property = input[key];
        formData.append(
          key,
          property instanceof Blob
            ? property
            : typeof property === 'object' && property !== null
              ? JSON.stringify(property)
              : `${property}`
        );
        return formData;
      }, new FormData()),
    [ContentType.UrlEncoded]: (input: any) => this.toQueryString(input),
  };

  protected mergeRequestParams(params1: RequestParams, params2?: RequestParams): RequestParams {
    return {
      ...this.baseApiParams,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...(this.baseApiParams.headers || {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  protected createAbortSignal = (cancelToken: CancelToken): AbortSignal | undefined => {
    if (this.abortControllers.has(cancelToken)) {
      const abortController = this.abortControllers.get(cancelToken);
      if (abortController) {
        return abortController.signal;
      }
      return void 0;
    }

    const abortController = new AbortController();
    this.abortControllers.set(cancelToken, abortController);
    return abortController.signal;
  };

  public abortRequest = (cancelToken: CancelToken) => {
    const abortController = this.abortControllers.get(cancelToken);

    if (abortController) {
      abortController.abort();
      this.abortControllers.delete(cancelToken);
    }
  };

  public request = async <T = any, E = any>({
    body,
    secure,
    path,
    type,
    query,
    format,
    baseUrl,
    cancelToken,
    ...params
  }: FullRequestParams): Promise<HttpResponse<T, E>> => {
    const secureParams =
      ((typeof secure === 'boolean' ? secure : this.baseApiParams.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const queryString = query && this.toQueryString(query);
    const payloadFormatter = this.contentFormatters[type || ContentType.Json];
    const responseFormat = format || requestParams.format;

    return this.customFetch(
      `${baseUrl || this.baseUrl || ''}${path}${queryString ? `?${queryString}` : ''}`,
      {
        ...requestParams,
        headers: {
          ...(requestParams.headers || {}),
          ...(type && type !== ContentType.FormData ? { 'Content-Type': type } : {}),
        },
        signal: (cancelToken ? this.createAbortSignal(cancelToken) : requestParams.signal) || null,
        body: typeof body === 'undefined' || body === null ? null : payloadFormatter(body),
      }
    ).then(async (response) => {
      const r = response as HttpResponse<T, E>;
      r.data = null as unknown as T;
      r.error = null as unknown as E;

      const data = !responseFormat
        ? r
        : await response[responseFormat]()
            .then((data) => {
              if (r.ok) {
                r.data = data;
              } else {
                r.error = data;
              }
              return r;
            })
            .catch((e) => {
              r.error = e;
              return r;
            });

      if (cancelToken) {
        this.abortControllers.delete(cancelToken);
      }

      if (!response.ok) throw data;
      return data;
    });
  };
}

/**
 * @title Event Driven Ansible API
 * @version 1.0.0
 * @baseUrl /api/eda/v1
 */
export class Api<SecurityDataType extends unknown> extends HttpClient<SecurityDataType> {
  activationInstances = {
    /**
     * @description List all the Activation Instances
     *
     * @tags activation-instances
     * @name ActivationInstancesList
     * @request GET:/activation-instances/
     * @secure
     */
    activationInstancesList: (
      query?: {
        /** Filter by activation instance name. */
        name?: string;
        /** A page number within the paginated result set. */
        page?: number;
        /** Number of results to return per page. */
        page_size?: number;
        /** Filter by activation instance status. */
        status?: string;
      },
      params: RequestParams = {}
    ) =>
      this.request<PaginatedActivationInstanceList, any>({
        path: `/activation-instances/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description List all logs for the Activation Instance
     *
     * @tags activation-instances
     * @name ActivationInstancesLogsList
     * @request GET:/activation-instances/{id}/logs/
     * @secure
     */
    activationInstancesLogsList: (
      id: number,
      query?: {
        /** Filter by activation instance log. */
        log?: string;
        /** A page number within the paginated result set. */
        page?: number;
        /** Number of results to return per page. */
        page_size?: number;
      },
      params: RequestParams = {}
    ) =>
      this.request<PaginatedActivationInstanceLogList, any>({
        path: `/activation-instances/${id}/logs/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Get the Activation Instance by its id
     *
     * @tags activation-instances
     * @name ActivationInstancesRetrieve
     * @request GET:/activation-instances/{id}/
     * @secure
     */
    activationInstancesRetrieve: (id: number, params: RequestParams = {}) =>
      this.request<ActivationInstance, any>({
        path: `/activation-instances/${id}/`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Delete an existing Activation Instance
     *
     * @tags activation-instances
     * @name ActivationInstancesDestroy
     * @request DELETE:/activation-instances/{id}/
     * @secure
     */
    activationInstancesDestroy: (id: number, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/activation-instances/${id}/`,
        method: 'DELETE',
        secure: true,
        ...params,
      }),
  };
  activations = {
    /**
     * @description List all Activations
     *
     * @tags activations
     * @name ActivationsList
     * @request GET:/activations/
     * @secure
     */
    activationsList: (
      query?: {
        /** Filter by Credential ID. */
        credential_id?: number;
        /** Filter by Decision Environment ID. */
        decision_environment_id?: number;
        /** Filter by activation name. */
        name?: string;
        /** A page number within the paginated result set. */
        page?: number;
        /** Number of results to return per page. */
        page_size?: number;
        /** Filter by activation status. */
        status?: string;
      },
      params: RequestParams = {}
    ) =>
      this.request<PaginatedActivationListList, any>({
        path: `/activations/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags activations
     * @name ActivationsCreate
     * @request POST:/activations/
     * @secure
     */
    activationsCreate: (data: ActivationCreate, params: RequestParams = {}) =>
      this.request<ActivationRead, any>({
        path: `/activations/`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description List all instances for the Activation
     *
     * @tags activations
     * @name ActivationsInstancesList
     * @request GET:/activations/{id}/instances/
     * @secure
     */
    activationsInstancesList: (
      id: number,
      query?: {
        /** Filter by activation instance name. */
        name?: string;
        /** A page number within the paginated result set. */
        page?: number;
        /** Number of results to return per page. */
        page_size?: number;
        /** Filter by activation instance status. */
        status?: string;
      },
      params: RequestParams = {}
    ) =>
      this.request<PaginatedActivationInstanceList, any>({
        path: `/activations/${id}/instances/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags activations
     * @name ActivationsRetrieve
     * @request GET:/activations/{id}/
     * @secure
     */
    activationsRetrieve: (id: number, params: RequestParams = {}) =>
      this.request<ActivationRead, any>({
        path: `/activations/${id}/`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Delete an existing Activation
     *
     * @tags activations
     * @name ActivationsDestroy
     * @request DELETE:/activations/{id}/
     * @secure
     */
    activationsDestroy: (id: number, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/activations/${id}/`,
        method: 'DELETE',
        secure: true,
        ...params,
      }),

    /**
     * @description Disable the Activation
     *
     * @tags activations
     * @name ActivationsDisableCreate
     * @request POST:/activations/{id}/disable/
     * @secure
     */
    activationsDisableCreate: (id: number, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/activations/${id}/disable/`,
        method: 'POST',
        secure: true,
        ...params,
      }),

    /**
     * @description Enable the Activation
     *
     * @tags activations
     * @name ActivationsEnableCreate
     * @request POST:/activations/{id}/enable/
     * @secure
     */
    activationsEnableCreate: (id: number, params: RequestParams = {}) =>
      this.request<void, void>({
        path: `/activations/${id}/enable/`,
        method: 'POST',
        secure: true,
        ...params,
      }),

    /**
     * @description Restart the Activation
     *
     * @tags activations
     * @name ActivationsRestartCreate
     * @request POST:/activations/{id}/restart/
     * @secure
     */
    activationsRestartCreate: (id: number, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/activations/${id}/restart/`,
        method: 'POST',
        secure: true,
        ...params,
      }),
  };
  auditEvents = {
    /**
     * @description List all audit events
     *
     * @tags audit-events
     * @name AuditEventsList
     * @request GET:/audit-events/
     * @secure
     */
    auditEventsList: (
      query?: {
        /** A page number within the paginated result set. */
        page?: number;
        /** Number of results to return per page. */
        page_size?: number;
        /** Filter by rule audit event source name. */
        source_name?: string;
      },
      params: RequestParams = {}
    ) =>
      this.request<PaginatedAuditEventList, any>({
        path: `/audit-events/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Get the audit event by its id
     *
     * @tags audit-events
     * @name AuditEventsRetrieve
     * @request GET:/audit-events/{id}/
     * @secure
     */
    auditEventsRetrieve: (id: string, params: RequestParams = {}) =>
      this.request<AuditEvent, any>({
        path: `/audit-events/${id}/`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),
  };
  auditRules = {
    /**
     * @description List all fired rules
     *
     * @tags audit-rules
     * @name AuditRulesList
     * @request GET:/audit-rules/
     * @secure
     */
    auditRulesList: (
      query?: {
        /** Filter by rule audit name. */
        name?: string;
        /** A page number within the paginated result set. */
        page?: number;
        /** Number of results to return per page. */
        page_size?: number;
      },
      params: RequestParams = {}
    ) =>
      this.request<PaginatedAuditRuleListList, any>({
        path: `/audit-rules/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Action list of a fired rule by its id
     *
     * @tags audit-rules
     * @name AuditRulesActionsList
     * @request GET:/audit-rules/{id}/actions/
     * @secure
     */
    auditRulesActionsList: (
      id: number,
      query?: {
        /** Filter by rule audit action name. */
        name?: string;
        /** A page number within the paginated result set. */
        page?: number;
        /** Number of results to return per page. */
        page_size?: number;
      },
      params: RequestParams = {}
    ) =>
      this.request<PaginatedAuditActionList, any>({
        path: `/audit-rules/${id}/actions/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Event list of a fired rule by its id
     *
     * @tags audit-rules
     * @name AuditRulesEventsList
     * @request GET:/audit-rules/{id}/events/
     * @secure
     */
    auditRulesEventsList: (
      id: number,
      query?: {
        /** A page number within the paginated result set. */
        page?: number;
        /** Number of results to return per page. */
        page_size?: number;
        /** Filter by rule audit event source name. */
        source_name?: string;
      },
      params: RequestParams = {}
    ) =>
      this.request<PaginatedAuditEventList, any>({
        path: `/audit-rules/${id}/events/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Get the fired rule by its id
     *
     * @tags audit-rules
     * @name AuditRulesRetrieve
     * @request GET:/audit-rules/{id}/
     * @secure
     */
    auditRulesRetrieve: (id: number, params: RequestParams = {}) =>
      this.request<AuditRuleDetail, any>({
        path: `/audit-rules/${id}/`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),
  };
  auth = {
    /**
     * @description Use this method to set a CSRF cookie.
     *
     * @tags auth
     * @name AuthSessionPreflight
     * @request GET:/auth/session/login/
     * @secure
     */
    authSessionPreflight: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/auth/session/login/`,
        method: 'GET',
        secure: true,
        ...params,
      }),

    /**
     * @description Session cookie login
     *
     * @tags auth
     * @name AuthSessionLogin
     * @request POST:/auth/session/login/
     * @secure
     */
    authSessionLogin: (data: Login, params: RequestParams = {}) =>
      this.request<void, void>({
        path: `/auth/session/login/`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description Session logout.
     *
     * @tags auth
     * @name AuthSessionLogout
     * @request POST:/auth/session/logout/
     * @secure
     */
    authSessionLogout: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/auth/session/logout/`,
        method: 'POST',
        secure: true,
        ...params,
      }),
  };
  credentials = {
    /**
     * @description List all credentials
     *
     * @tags credentials
     * @name CredentialsList
     * @request GET:/credentials/
     * @secure
     */
    credentialsList: (
      query?: {
        /** Filter by credential name. */
        name?: string;
        /** A page number within the paginated result set. */
        page?: number;
        /** Number of results to return per page. */
        page_size?: number;
      },
      params: RequestParams = {}
    ) =>
      this.request<PaginatedCredentialList, any>({
        path: `/credentials/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Create a new credential.
     *
     * @tags credentials
     * @name CredentialsCreate
     * @request POST:/credentials/
     * @secure
     */
    credentialsCreate: (data: CredentialCreate, params: RequestParams = {}) =>
      this.request<Credential, any>({
        path: `/credentials/`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Get credential by id
     *
     * @tags credentials
     * @name CredentialsRetrieve
     * @request GET:/credentials/{id}/
     * @secure
     */
    credentialsRetrieve: (id: number, params: RequestParams = {}) =>
      this.request<Credential, any>({
        path: `/credentials/${id}/`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Partial update of a credential
     *
     * @tags credentials
     * @name CredentialsPartialUpdate
     * @request PATCH:/credentials/{id}/
     * @secure
     */
    credentialsPartialUpdate: (
      id: number,
      data: PatchedCredentialCreate,
      params: RequestParams = {}
    ) =>
      this.request<Credential, any>({
        path: `/credentials/${id}/`,
        method: 'PATCH',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Delete a credential by id
     *
     * @tags credentials
     * @name CredentialsDestroy
     * @request DELETE:/credentials/{id}/
     * @secure
     */
    credentialsDestroy: (
      id: number,
      query?: {
        /** Force deletion if there are dependent objects */
        force?: boolean;
      },
      params: RequestParams = {}
    ) =>
      this.request<void, any>({
        path: `/credentials/${id}/`,
        method: 'DELETE',
        query: query,
        secure: true,
        ...params,
      }),
  };
  decisionEnvironments = {
    /**
     * @description List all decision environments
     *
     * @tags decision-environments
     * @name DecisionEnvironmentsList
     * @request GET:/decision-environments/
     * @secure
     */
    decisionEnvironmentsList: (
      query?: {
        /** Filter by decision environment name. */
        name?: string;
        /** A page number within the paginated result set. */
        page?: number;
        /** Number of results to return per page. */
        page_size?: number;
      },
      params: RequestParams = {}
    ) =>
      this.request<PaginatedDecisionEnvironmentList, any>({
        path: `/decision-environments/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Create a new decision environment.
     *
     * @tags decision-environments
     * @name DecisionEnvironmentsCreate
     * @request POST:/decision-environments/
     * @secure
     */
    decisionEnvironmentsCreate: (data: DecisionEnvironmentCreate, params: RequestParams = {}) =>
      this.request<DecisionEnvironment, any>({
        path: `/decision-environments/`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Get a decision environment by id
     *
     * @tags decision-environments
     * @name DecisionEnvironmentsRetrieve
     * @request GET:/decision-environments/{id}/
     * @secure
     */
    decisionEnvironmentsRetrieve: (id: number, params: RequestParams = {}) =>
      this.request<DecisionEnvironmentRead, any>({
        path: `/decision-environments/${id}/`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Partially update a decision environment
     *
     * @tags decision-environments
     * @name DecisionEnvironmentsPartialUpdate
     * @request PATCH:/decision-environments/{id}/
     * @secure
     */
    decisionEnvironmentsPartialUpdate: (
      id: number,
      data: PatchedDecisionEnvironmentCreate,
      params: RequestParams = {}
    ) =>
      this.request<DecisionEnvironment, any>({
        path: `/decision-environments/${id}/`,
        method: 'PATCH',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Delete a decision environment by id
     *
     * @tags decision-environments
     * @name DecisionEnvironmentsDestroy
     * @request DELETE:/decision-environments/{id}/
     * @secure
     */
    decisionEnvironmentsDestroy: (
      id: number,
      query?: {
        /** Force deletion if there are dependent objects */
        force?: boolean;
      },
      params: RequestParams = {}
    ) =>
      this.request<void, void>({
        path: `/decision-environments/${id}/`,
        method: 'DELETE',
        query: query,
        secure: true,
        ...params,
      }),
  };
  extraVars = {
    /**
     * @description List all extra_vars
     *
     * @tags extra-vars
     * @name ExtraVarsList
     * @request GET:/extra-vars/
     * @secure
     */
    extraVarsList: (
      query?: {
        /** A page number within the paginated result set. */
        page?: number;
        /** Number of results to return per page. */
        page_size?: number;
      },
      params: RequestParams = {}
    ) =>
      this.request<PaginatedExtraVarList, any>({
        path: `/extra-vars/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Create an extra_var
     *
     * @tags extra-vars
     * @name ExtraVarsCreate
     * @request POST:/extra-vars/
     * @secure
     */
    extraVarsCreate: (data: ExtraVarCreate, params: RequestParams = {}) =>
      this.request<ExtraVar, any>({
        path: `/extra-vars/`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Get the extra_var by its id
     *
     * @tags extra-vars
     * @name ExtraVarsRetrieve
     * @request GET:/extra-vars/{id}/
     * @secure
     */
    extraVarsRetrieve: (id: number, params: RequestParams = {}) =>
      this.request<ExtraVar, any>({
        path: `/extra-vars/${id}/`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),
  };
  projects = {
    /**
     * @description List all projects
     *
     * @tags projects
     * @name ProjectsList
     * @request GET:/projects/
     * @secure
     */
    projectsList: (
      query?: {
        /** Filter by project name. */
        name?: string;
        /** A page number within the paginated result set. */
        page?: number;
        /** Number of results to return per page. */
        page_size?: number;
        /** Filter by project url. */
        url?: string;
      },
      params: RequestParams = {}
    ) =>
      this.request<PaginatedProjectList, any>({
        path: `/projects/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Import a project.
     *
     * @tags projects
     * @name ProjectsCreate
     * @request POST:/projects/
     * @secure
     */
    projectsCreate: (data: ProjectCreateRequest, params: RequestParams = {}) =>
      this.request<Project, any>({
        path: `/projects/`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Get a project by id
     *
     * @tags projects
     * @name ProjectsRetrieve
     * @request GET:/projects/{id}/
     * @secure
     */
    projectsRetrieve: (id: number, params: RequestParams = {}) =>
      this.request<ProjectRead, any>({
        path: `/projects/${id}/`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Partial update of a project
     *
     * @tags projects
     * @name ProjectsPartialUpdate
     * @request PATCH:/projects/{id}/
     * @secure
     */
    projectsPartialUpdate: (
      id: number,
      data: PatchedProjectUpdateRequest,
      params: RequestParams = {}
    ) =>
      this.request<Project, void>({
        path: `/projects/${id}/`,
        method: 'PATCH',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Delete a project by id
     *
     * @tags projects
     * @name ProjectsDestroy
     * @request DELETE:/projects/{id}/
     * @secure
     */
    projectsDestroy: (id: number, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/projects/${id}/`,
        method: 'DELETE',
        secure: true,
        ...params,
      }),

    /**
     * @description Sync a project
     *
     * @tags projects
     * @name ProjectsSyncCreate
     * @request POST:/projects/{id}/sync/
     * @secure
     */
    projectsSyncCreate: (id: number, params: RequestParams = {}) =>
      this.request<Project, any>({
        path: `/projects/${id}/sync/`,
        method: 'POST',
        secure: true,
        format: 'json',
        ...params,
      }),
  };
  roles = {
    /**
     * @description List all roles
     *
     * @tags roles
     * @name RolesList
     * @request GET:/roles/
     * @secure
     */
    rolesList: (
      query?: {
        /** Filter roles by name. */
        name?: string;
        /** A page number within the paginated result set. */
        page?: number;
        /** Number of results to return per page. */
        page_size?: number;
      },
      params: RequestParams = {}
    ) =>
      this.request<PaginatedRoleListList, any>({
        path: `/roles/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Retrieve a role by id
     *
     * @tags roles
     * @name RolesRetrieve
     * @request GET:/roles/{id}/
     * @secure
     */
    rolesRetrieve: (id: string, params: RequestParams = {}) =>
      this.request<RoleDetail, any>({
        path: `/roles/${id}/`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),
  };
  rulebooks = {
    /**
     * @description List all rulebooks
     *
     * @tags rulebooks
     * @name RulebooksList
     * @request GET:/rulebooks/
     * @secure
     */
    rulebooksList: (
      query?: {
        /** Filter by rulebook name. */
        name?: string;
        /** A page number within the paginated result set. */
        page?: number;
        /** Number of results to return per page. */
        page_size?: number;
        /** Filter by rulebook's project id. */
        project_id?: number;
      },
      params: RequestParams = {}
    ) =>
      this.request<PaginatedRulebookList, any>({
        path: `/rulebooks/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Ruleset list of a rulebook by its id
     *
     * @tags rulebooks
     * @name RulebooksRulesetsList
     * @request GET:/rulebooks/{id}/rulesets/
     * @secure
     */
    rulebooksRulesetsList: (
      id: number,
      query?: {
        /** Filter by ruleset name. */
        name?: string;
        /** A page number within the paginated result set. */
        page?: number;
        /** Number of results to return per page. */
        page_size?: number;
      },
      params: RequestParams = {}
    ) =>
      this.request<PaginatedRulesetOutList, any>({
        path: `/rulebooks/${id}/rulesets/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Get the rulebook by its id
     *
     * @tags rulebooks
     * @name RulebooksRetrieve
     * @request GET:/rulebooks/{id}/
     * @secure
     */
    rulebooksRetrieve: (id: number, params: RequestParams = {}) =>
      this.request<Rulebook, any>({
        path: `/rulebooks/${id}/`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Get the JSON format of a rulebook by its id
     *
     * @tags rulebooks
     * @name RulebooksJsonRetrieve
     * @request GET:/rulebooks/{id}/json/
     * @secure
     */
    rulebooksJsonRetrieve: (id: number, params: RequestParams = {}) =>
      this.request<Rulebook, any>({
        path: `/rulebooks/${id}/json/`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),
  };
  rules = {
    /**
     * @description List all rules
     *
     * @tags rules
     * @name RulesList
     * @request GET:/rules/
     * @secure
     */
    rulesList: (
      query?: {
        /** A page number within the paginated result set. */
        page?: number;
        /** Number of results to return per page. */
        page_size?: number;
      },
      params: RequestParams = {}
    ) =>
      this.request<PaginatedRuleOutList, any>({
        path: `/rules/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Get the rule by its id
     *
     * @tags rules
     * @name RulesRetrieve
     * @request GET:/rules/{id}/
     * @secure
     */
    rulesRetrieve: (id: number, params: RequestParams = {}) =>
      this.request<RuleOut, any>({
        path: `/rules/${id}/`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),
  };
  rulesets = {
    /**
     * @description List all rulesets
     *
     * @tags rulesets
     * @name RulesetsList
     * @request GET:/rulesets/
     * @secure
     */
    rulesetsList: (
      query?: {
        /** Filter by ruleset name. */
        name?: string;
        /** A page number within the paginated result set. */
        page?: number;
        /** Number of results to return per page. */
        page_size?: number;
      },
      params: RequestParams = {}
    ) =>
      this.request<PaginatedRulesetOutList, any>({
        path: `/rulesets/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Get the ruleset by its id
     *
     * @tags rulesets
     * @name RulesetsRetrieve
     * @request GET:/rulesets/{id}/
     * @secure
     */
    rulesetsRetrieve: (id: number, params: RequestParams = {}) =>
      this.request<RulesetOut, any>({
        path: `/rulesets/${id}/`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Rule list of a ruleset by its id
     *
     * @tags rulesets
     * @name RulesetsRulesList
     * @request GET:/rulesets/{id}/rules/
     * @secure
     */
    rulesetsRulesList: (
      id: number,
      query?: {
        /** Filter by ruleset name. */
        name?: string;
        /** A page number within the paginated result set. */
        page?: number;
        /** Number of results to return per page. */
        page_size?: number;
      },
      params: RequestParams = {}
    ) =>
      this.request<PaginatedRuleList, any>({
        path: `/rulesets/${id}/rules/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),
  };
  tasks = {
    /**
     * No description
     *
     * @tags tasks
     * @name TasksList
     * @request GET:/tasks/
     * @secure
     */
    tasksList: (params: RequestParams = {}) =>
      this.request<Task[], any>({
        path: `/tasks/`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags tasks
     * @name TasksRetrieve
     * @request GET:/tasks/{id}/
     * @secure
     */
    tasksRetrieve: (id: string, params: RequestParams = {}) =>
      this.request<Task, any>({
        path: `/tasks/${id}/`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),
  };
  users = {
    /**
     * @description List all users
     *
     * @tags users
     * @name UsersList
     * @request GET:/users/
     * @secure
     */
    usersList: (
      query?: {
        /** Filter by Username. */
        name?: string;
        /** A page number within the paginated result set. */
        page?: number;
        /** Number of results to return per page. */
        page_size?: number;
        username?: string;
      },
      params: RequestParams = {}
    ) =>
      this.request<PaginatedUserListList, any>({
        path: `/users/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Create a user
     *
     * @tags users
     * @name UsersCreate
     * @request POST:/users/
     * @secure
     */
    usersCreate: (data: UserCreateUpdate, params: RequestParams = {}) =>
      this.request<UserDetail, any>({
        path: `/users/`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Retrieve a user by their id
     *
     * @tags users
     * @name UsersRetrieve
     * @request GET:/users/{id}/
     * @secure
     */
    usersRetrieve: (id: number, params: RequestParams = {}) =>
      this.request<UserDetail, any>({
        path: `/users/${id}/`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Partial update of a user.
     *
     * @tags users
     * @name UsersPartialUpdate
     * @request PATCH:/users/{id}/
     * @secure
     */
    usersPartialUpdate: (id: number, data: PatchedUserCreateUpdate, params: RequestParams = {}) =>
      this.request<UserDetail, any>({
        path: `/users/${id}/`,
        method: 'PATCH',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Delete a user by id
     *
     * @tags users
     * @name UsersDestroy
     * @request DELETE:/users/{id}/
     * @secure
     */
    usersDestroy: (id: number, params: RequestParams = {}) =>
      this.request<void, void>({
        path: `/users/${id}/`,
        method: 'DELETE',
        secure: true,
        ...params,
      }),

    /**
     * @description Get current user.
     *
     * @tags users
     * @name GetCurrentUser
     * @request GET:/users/me/
     * @secure
     */
    getCurrentUser: (params: RequestParams = {}) =>
      this.request<UserDetail, any>({
        path: `/users/me/`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Update current user.
     *
     * @tags users
     * @name UpdateCurrentUser
     * @request PATCH:/users/me/
     * @secure
     */
    updateCurrentUser: (data: PatchedCurrentUserUpdate, params: RequestParams = {}) =>
      this.request<UserDetail, any>({
        path: `/users/me/`,
        method: 'PATCH',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description List current user AWX tokens.
     *
     * @tags users
     * @name UsersMeAwxTokensList
     * @request GET:/users/me/awx-tokens/
     * @secure
     */
    usersMeAwxTokensList: (
      query?: {
        /** A page number within the paginated result set. */
        page?: number;
        /** Number of results to return per page. */
        page_size?: number;
      },
      params: RequestParams = {}
    ) =>
      this.request<PaginatedAwxTokenList, any>({
        path: `/users/me/awx-tokens/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Create a AWX token for a current user.
     *
     * @tags users
     * @name UsersMeAwxTokensCreate
     * @request POST:/users/me/awx-tokens/
     * @secure
     */
    usersMeAwxTokensCreate: (data: AwxTokenCreate, params: RequestParams = {}) =>
      this.request<AwxToken, any>({
        path: `/users/me/awx-tokens/`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Get current user AWX token by ID.
     *
     * @tags users
     * @name UsersMeAwxTokensRetrieve
     * @request GET:/users/me/awx-tokens/{id}/
     * @secure
     */
    usersMeAwxTokensRetrieve: (id: number, params: RequestParams = {}) =>
      this.request<AwxToken, any>({
        path: `/users/me/awx-tokens/${id}/`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Delete AWX token of a current user by ID.
     *
     * @tags users
     * @name UsersMeAwxTokensDestroy
     * @request DELETE:/users/me/awx-tokens/{id}/
     * @secure
     */
    usersMeAwxTokensDestroy: (id: number, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/users/me/awx-tokens/${id}/`,
        method: 'DELETE',
        secure: true,
        ...params,
      }),
  };
}

/** Serializer for creating the Event stream. */
export interface EventStreamCreate {
  name: string;
  description: string;
  source_args?: string;
  source_type?: string;
  decision_environment_id: number;
  user?: string;
  uuid?: string;
  /**
   * * `always` - always
   * * `on-failure` - on-failure
   * * `never` - never
   */
  restart_policy?: RestartPolicyEnum;
  log_level: LogLevelEnum;
}

/** Serializer for the Activation Instance model. */
export interface EventStreamInstance {
  id: number;
  name?: string;
  /**
   * * `starting` - starting
   * * `running` - running
   * * `pending` - pending
   * * `failed` - failed
   * * `stopping` - stopping
   * * `stopped` - stopped
   * * `deleting` - deleting
   * * `completed` - completed
   * * `unresponsive` - unresponsive
   * * `error` - error
   */
  status?: Status906Enum;
  git_hash?: string;
  status_message?: string | null;
  event_stream_id?: string;
  /** @format date-time */
  started_at: string;
  /** @format date-time */
  ended_at: string | null;
}

/** Serializer for the Activation Instance Log model. */
export interface EventStreamInstanceLog {
  id: number;
  /**
   * @min -2147483648
   * @max 2147483647
   */
  line_number: number;
  log: string;
  event_stream_instance: number;
}

/** Serializer for listing the Activation model objects. */
export interface EventStreamList {
  id: number;
  name: string;
  description?: string;
  is_enabled?: boolean;
  /**
   * * `starting` - starting
   * * `running` - running
   * * `pending` - pending
   * * `failed` - failed
   * * `stopping` - stopping
   * * `stopped` - stopped
   * * `deleting` - deleting
   * * `completed` - completed
   * * `unresponsive` - unresponsive
   * * `error` - error
   */
  status?: Status906Enum;
  decision_environment_id: number | null;
  project_id: number | null;
  rulebook_id: number | null;
  extra_var_id: number | null;
  /**
   * * `always` - always
   * * `on-failure` - on-failure
   * * `never` - never
   */
  restart_policy?: RestartPolicyEnum;
  log_level: LogLevelEnum;
  /**
   * @min -2147483648
   * @max 2147483647
   */
  restart_count?: number;
  /** Name of the referenced rulebook */
  rulebook_name: string;
  current_job_id?: string | null;
  rules_count: number;
  rules_fired_count: number;
  /** @format date-time */
  created_at: string;
  /** @format date-time */
  modified_at: string;
  status_message?: string | null;
}

export interface EventStreamRef {
  id: string;
  name: string;
}

/** Serializer for reading the Activation with related objects info. */
export interface EventStreamRead {
  id: number;
  name: string;
  source_args?: string;
  source_type?: string;
  description?: string;
  is_enabled?: boolean;
  decision_environment?: DecisionEnvironmentRef | null;
  credentials?: CredentialRef[];
  user?: string;
  uuid?: string;
  /**
   * * `starting` - starting
   * * `running` - running
   * * `pending` - pending
   * * `failed` - failed
   * * `stopping` - stopping
   * * `stopped` - stopped
   * * `deleting` - deleting
   * * `completed` - completed
   * * `unresponsive` - unresponsive
   * * `error` - error
   */
  status?: Status906Enum;
  git_hash?: string;
  project?: ProjectRef | null;
  rulebook?: RulebookRef | null;
  extra_var?: ExtraVarRef | null;
  instances: EventStreamInstance[];
  /**
   * * `always` - always
   * * `on-failure` - on-failure
   * * `never` - never
   */
  restart_policy?: RestartPolicyEnum;
  log_level: LogLevelEnum;
  /**
   * @min -2147483648
   * @max 2147483647
   */
  restart_count?: number;
  /** Name of the referenced rulebook */
  rulebook_name: string;
  current_job_id?: string | null;
  rules_count: number;
  rules_fired_count: number;
  /** @format date-time */
  created_at: string;
  /** @format date-time */
  modified_at: string;
  /** @format date-time */
  restarted_at?: string | null;
  status_message?: string | null;
}
