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

/** Serializer for creating the Activation. */
export interface ActivationCreate {
  name: string;
  description?: string;
  is_enabled?: boolean;
  decision_environment_id: number;
  rulebook_id: number;
  extra_var?: string | null;
  organization_id?: number | null;
  /**
   * * `always` - always
   * * `on-failure` - on-failure
   * * `never` - never
   */
  restart_policy?: RestartPolicyEnum;
  awx_token_id?: number | null;
  event_streams?: number[] | null;
  /**
   * * `debug` - debug
   * * `info` - info
   * * `error` - error
   */
  log_level?: LogLevelEnum;
  eda_credentials?: number[] | null;
  k8s_service_name?: string | null;
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
   * * `workers offline` - workers offline
   */
  status?: StatusEnum;
  git_hash?: string;
  status_message?: string | null;
  activation_id: number | null;
  event_stream_id: number | null;
  organization_id: number | null;
  /** @format date-time */
  started_at: string;
  /** @format date-time */
  ended_at: string | null;
  queue_name: string | null;
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
  /**
   * @format int64
   * @min -9223372036854776000
   * @max 9223372036854776000
   */
  log_timestamp?: number;
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
   * * `workers offline` - workers offline
   */
  status?: StatusEnum;
  extra_var?: string | null;
  decision_environment_id: number | null;
  project_id: number | null;
  rulebook_id: number | null;
  organization_id: number | null;
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
  awx_token_id: number | null;
  event_streams?: EventStreamOut[] | null;
  /**
   * * `debug` - debug
   * * `info` - info
   * * `error` - error
   */
  log_level?: LogLevelEnum;
  eda_credentials?: EdaCredential[] | null;
  /** Service name of the activation */
  k8s_service_name?: string | null;
}

/** Serializer for reading the Activation with related objects info. */
export interface ActivationRead {
  id: number;
  name: string;
  description?: string;
  is_enabled?: boolean;
  decision_environment?: DecisionEnvironmentRef | null;
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
   * * `workers offline` - workers offline
   */
  status?: StatusEnum;
  git_hash?: string;
  project?: ProjectRef | null;
  rulebook?: RulebookRef | null;
  extra_var?: string | null;
  organization: OrganizationRef;
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
  awx_token_id: number | null;
  eda_credentials?: EdaCredential[] | null;
  event_streams?: EventStreamOut[] | null;
  /**
   * * `debug` - debug
   * * `info` - info
   * * `error` - error
   */
  log_level?: LogLevelEnum;
  /** Service name of the activation */
  k8s_service_name?: string | null;
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
  /** Message of the action */
  status_message?: string | null;
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
  /** The payload in the event */
  payload?: string | null;
  audit_actions: string[];
  /**
   * The received timestamp of the event
   * @format date-time
   */
  received_at: string;
  /** @format date-time */
  rule_fired_at?: string | null;
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
  /** @example {"id":0,"name":"string","description":"string"} */
  organization: {
    id?: number;
    name?: string;
    description?: string;
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
  /** @example {"id":0,"name":"string","description":"string"} */
  organization: {
    id?: number;
    name?: string;
    description?: string;
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

/**
 * * `eda.activation` - Activation
 * * `eda.auditrule` - Audit Rule
 * * `eda.credentialtype` - Credential Type
 * * `eda.decisionenvironment` - Decision Environment
 * * `eda.edacredential` - Eda Credential
 * * `eda.project` - Project
 * * `eda.rulebook` - Rulebook
 * * `eda.rulebookprocess` - Rulebook Process
 * * `shared.organization` - Organization
 * * `shared.team` - Team
 */
export enum ContentTypeEnum {
  EdaActivation = 'eda.activation',
  EdaAuditrule = 'eda.auditrule',
  EdaCredentialtype = 'eda.credentialtype',
  EdaDecisionenvironment = 'eda.decisionenvironment',
  EdaEdacredential = 'eda.edacredential',
  EdaProject = 'eda.project',
  EdaRulebook = 'eda.rulebook',
  EdaRulebookprocess = 'eda.rulebookprocess',
  SharedOrganization = 'shared.organization',
  SharedTeam = 'shared.team',
}

export interface CredentialType {
  name: string;
  namespace?: string | null;
  kind?: string;
  description?: string;
  inputs?: Record<string, any>;
  injectors?: Record<string, any>;
  id: number;
  /** @format date-time */
  created_at: string;
  /** @format date-time */
  modified_at: string;
  managed: boolean;
  organization_id: number | null;
}

export interface CredentialTypeCreate {
  name: string;
  description?: string;
  /** Name of the credential type */
  inputs: Record<string, any>;
  injectors?: Record<string, any>;
  organization_id?: number | null;
}

export interface CredentialTypeRef {
  id: number;
  name: string;
  namespace?: string | null;
  kind?: string;
  organization_id: number | null;
}

export interface DecisionEnvironment {
  name: string;
  description?: string;
  image_url: string;
  organization_id: number | null;
  eda_credential_id: number | null;
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
  organization_id?: number | null;
  eda_credential_id?: number | null;
}

/** Serializer for reading the DecisionEnvironment with embedded objects. */
export interface DecisionEnvironmentRead {
  id: number;
  name: string;
  description?: string;
  image_url: string;
  organization: OrganizationRef;
  eda_credential?: EdaCredentialRef | null;
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
  organization_id: number | null;
}

export interface EdaCredential {
  name: string;
  description?: string;
  inputs: Record<string, any>;
  credential_type?: CredentialTypeRef | null;
  references?: EdaCredentialReference[] | null;
  id: number;
  /** @format date-time */
  created_at: string;
  /** @format date-time */
  modified_at: string;
  managed: boolean;
  organization: OrganizationRef;
}

export interface EdaCredentialCreate {
  name: string;
  description?: string;
  inputs: Record<string, any>;
  credential_type_id: number | null;
  organization_id?: number | null;
}

/** Serializer for EdaCredential reference. */
export interface EdaCredentialRef {
  id: number;
  name: string;
  description?: string;
  inputs: Record<string, any>;
  managed?: boolean;
  credential_type_id: number | null;
  organization_id: number | null;
}

export interface EdaCredentialReference {
  /** Type of the related resource */
  type: string;
  /** ID of the related resource */
  id: number;
  /** Name of the related resource */
  name: string;
  /**
   * URL of the related resource
   * @format uri
   */
  url: string;
}

/** Serializer for UI to show EventStream. */
export interface EventStreamOut {
  id: number;
  name: string;
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

/**
 * * `debug` - debug
 * * `info` - info
 * * `error` - error
 */
export enum LogLevelEnum {
  Debug = 'debug',
  Info = 'info',
  Error = 'error',
}

export interface Login {
  username: string;
  password: string;
}

export type NullEnum = null;

export interface Organization {
  id: number;
  /**
   * The name of this resource
   * @maxLength 512
   */
  name: string;
  /** The organization description. */
  description?: string;
  resource: Record<string, any>;
  /**
   * The date/time this resource was created
   * @format date-time
   */
  created: string;
  /** The user who created this resource */
  created_by: number | null;
  /**
   * The date/time this resource was created
   * @format date-time
   */
  modified: string;
  /** The user who last modified this resource */
  modified_by: number | null;
}

export interface OrganizationCreate {
  /**
   * The name of this resource
   * @maxLength 512
   */
  name: string;
  /** The organization description. */
  description?: string;
}

export interface OrganizationRef {
  id: number;
  /**
   * The name of this resource
   * @maxLength 512
   */
  name: string;
  /** The organization description. */
  description?: string;
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

export interface PaginatedCredentialTypeList {
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
  results?: CredentialType[];
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

export interface PaginatedEdaCredentialList {
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
  results?: EdaCredential[];
}

export interface PaginatedOrganizationList {
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
  results?: Organization[];
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

export interface PaginatedResourceListList {
  /** @example 123 */
  count: number;
  /**
   * @format uri
   * @example "http://api.example.org/accounts/?page=4"
   */
  next?: string | null;
  /**
   * @format uri
   * @example "http://api.example.org/accounts/?page=2"
   */
  previous?: string | null;
  results: ResourceList[];
}

export interface PaginatedResourceTypeList {
  /** @example 123 */
  count: number;
  /**
   * @format uri
   * @example "http://api.example.org/accounts/?page=4"
   */
  next?: string | null;
  /**
   * @format uri
   * @example "http://api.example.org/accounts/?page=2"
   */
  previous?: string | null;
  results: ResourceType[];
}

export interface PaginatedRoleDefinitionList {
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
  results?: RoleDefinition[];
}

export interface PaginatedRoleTeamAssignmentList {
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
  results?: RoleTeamAssignment[];
}

export interface PaginatedRoleUserAssignmentList {
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
  results?: RoleUserAssignment[];
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

export interface PaginatedTeamList {
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
  results?: Team[];
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

export interface PatchedCredentialTypeCreate {
  name?: string;
  description?: string;
  /** Name of the credential type */
  inputs?: Record<string, any>;
  injectors?: Record<string, any>;
  organization_id?: number | null;
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
  organization_id?: number | null;
  eda_credential_id?: number | null;
}

export interface PatchedEdaCredentialCreate {
  name?: string;
  description?: string;
  inputs?: Record<string, any>;
  credential_type_id?: number | null;
  organization_id?: number | null;
}

export interface PatchedOrganizationCreate {
  /**
   * The name of this resource
   * @maxLength 512
   */
  name?: string;
  /** The organization description. */
  description?: string;
}

export interface PatchedProjectUpdateRequest {
  /** Name of the project */
  name?: string;
  /** Description of the project */
  description?: string | null;
  /** EdaCredential id of the project */
  eda_credential_id?: number | null;
  /** ID of an optional credential used for validating files in the project against unexpected changes */
  signature_validation_credential_id?: number | null;
  /** Specific branch, tag or commit to checkout. */
  scm_branch?: string | null;
  /** For git projects, an additional refspec to fetch. */
  scm_refspec?: string | null;
  /** Indicates if SSL verification is enabled */
  verify_ssl?: boolean;
  /** Proxy server for http or https connection */
  proxy?: string | null;
}

export interface PatchedResource {
  object_id?: string;
  name?: string | null;
  /** @format uuid */
  ansible_id?: string;
  /** @format uuid */
  service_id?: string;
  resource_type?: string;
  has_serializer?: boolean;
  resource_data?: Record<string, any>;
  url?: string;
}

export interface PatchedRoleDefinition {
  id?: number;
  url?: string;
  related?: Record<string, string>;
  summary_fields?: Record<string, Record<string, any>>;
  permissions?: PermissionsEnum[];
  /**
   * The type of resource this applies to
   *
   * * `eda.activation` - Activation
   * * `eda.auditrule` - Audit Rule
   * * `eda.credentialtype` - Credential Type
   * * `eda.decisionenvironment` - Decision Environment
   * * `eda.edacredential` - Eda Credential
   * * `eda.project` - Project
   * * `eda.rulebook` - Rulebook
   * * `eda.rulebookprocess` - Rulebook Process
   * * `shared.organization` - Organization
   * * `shared.team` - Team
   */
  content_type?: ContentTypeEnum | NullEnum | null;
  /**
   * The date/time this resource was created
   * @format date-time
   */
  modified?: string;
  /**
   * The date/time this resource was created
   * @format date-time
   */
  created?: string;
  name?: string;
  description?: string;
  managed?: boolean;
  /** The user who last modified this resource */
  modified_by?: number | null;
  /** The user who created this resource */
  created_by?: number | null;
}

export interface PatchedTeamUpdate {
  /**
   * The name of this resource
   * @maxLength 512
   */
  name?: string;
  /** The team description. */
  description?: string;
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
  /**
   * Superuser status
   * Designates that this user has all permissions without explicitly assigning them.
   */
  is_superuser?: boolean;
}

/**
 * * `eda.add_activation` - eda.add_activation
 * * `eda.add_credentialtype` - eda.add_credentialtype
 * * `eda.add_decisionenvironment` - eda.add_decisionenvironment
 * * `eda.add_edacredential` - eda.add_edacredential
 * * `eda.add_project` - eda.add_project
 * * `eda.add_team` - eda.add_team
 * * `eda.change_credentialtype` - eda.change_credentialtype
 * * `eda.change_decisionenvironment` - eda.change_decisionenvironment
 * * `eda.change_edacredential` - eda.change_edacredential
 * * `eda.change_organization` - eda.change_organization
 * * `eda.change_project` - eda.change_project
 * * `eda.change_team` - eda.change_team
 * * `eda.delete_activation` - eda.delete_activation
 * * `eda.delete_credentialtype` - eda.delete_credentialtype
 * * `eda.delete_decisionenvironment` - eda.delete_decisionenvironment
 * * `eda.delete_edacredential` - eda.delete_edacredential
 * * `eda.delete_organization` - eda.delete_organization
 * * `eda.delete_project` - eda.delete_project
 * * `eda.delete_team` - eda.delete_team
 * * `eda.disable_activation` - eda.disable_activation
 * * `eda.enable_activation` - eda.enable_activation
 * * `eda.member_organization` - eda.member_organization
 * * `eda.member_team` - eda.member_team
 * * `eda.restart_activation` - eda.restart_activation
 * * `eda.view_activation` - eda.view_activation
 * * `eda.view_auditrule` - eda.view_auditrule
 * * `eda.view_credentialtype` - eda.view_credentialtype
 * * `eda.view_decisionenvironment` - eda.view_decisionenvironment
 * * `eda.view_edacredential` - eda.view_edacredential
 * * `eda.view_organization` - eda.view_organization
 * * `eda.view_project` - eda.view_project
 * * `eda.view_rulebook` - eda.view_rulebook
 * * `eda.view_rulebookprocess` - eda.view_rulebookprocess
 * * `eda.view_team` - eda.view_team
 */
export enum PermissionsEnum {
  EdaAddActivation = 'eda.add_activation',
  EdaAddCredentialtype = 'eda.add_credentialtype',
  EdaAddDecisionenvironment = 'eda.add_decisionenvironment',
  EdaAddEdacredential = 'eda.add_edacredential',
  EdaAddProject = 'eda.add_project',
  EdaAddTeam = 'eda.add_team',
  EdaChangeCredentialtype = 'eda.change_credentialtype',
  EdaChangeDecisionenvironment = 'eda.change_decisionenvironment',
  EdaChangeEdacredential = 'eda.change_edacredential',
  EdaChangeOrganization = 'eda.change_organization',
  EdaChangeProject = 'eda.change_project',
  EdaChangeTeam = 'eda.change_team',
  EdaDeleteActivation = 'eda.delete_activation',
  EdaDeleteCredentialtype = 'eda.delete_credentialtype',
  EdaDeleteDecisionenvironment = 'eda.delete_decisionenvironment',
  EdaDeleteEdacredential = 'eda.delete_edacredential',
  EdaDeleteOrganization = 'eda.delete_organization',
  EdaDeleteProject = 'eda.delete_project',
  EdaDeleteTeam = 'eda.delete_team',
  EdaDisableActivation = 'eda.disable_activation',
  EdaEnableActivation = 'eda.enable_activation',
  EdaMemberOrganization = 'eda.member_organization',
  EdaMemberTeam = 'eda.member_team',
  EdaRestartActivation = 'eda.restart_activation',
  EdaViewActivation = 'eda.view_activation',
  EdaViewAuditrule = 'eda.view_auditrule',
  EdaViewCredentialtype = 'eda.view_credentialtype',
  EdaViewDecisionenvironment = 'eda.view_decisionenvironment',
  EdaViewEdacredential = 'eda.view_edacredential',
  EdaViewOrganization = 'eda.view_organization',
  EdaViewProject = 'eda.view_project',
  EdaViewRulebook = 'eda.view_rulebook',
  EdaViewRulebookprocess = 'eda.view_rulebookprocess',
  EdaViewTeam = 'eda.view_team',
}

export interface Project {
  name: string;
  description?: string;
  organization_id: number | null;
  eda_credential_id?: number | null;
  signature_validation_credential_id: number | null;
  scm_branch?: string;
  scm_refspec?: string;
  verify_ssl?: boolean;
  proxy: string;
  id: number;
  url: string;
  scm_type: ScmTypeEnum;
  git_hash: string;
  import_state: ImportStateEnum;
  import_error: string | null;
  /** @format date-time */
  created_at: string;
  /** @format date-time */
  modified_at: string;
}

export interface ProjectCreateRequest {
  url: string;
  proxy?: string;
  name: string;
  description?: string;
  organization_id?: number | null;
  eda_credential_id?: number | null;
  signature_validation_credential_id?: number | null;
  verify_ssl?: boolean;
  /** * `git` - Git */
  scm_type?: ScmTypeEnum;
  scm_branch?: string;
  scm_refspec?: string;
}

/** Serializer for reading the Project with embedded objects. */
export interface ProjectRead {
  name: string;
  description?: string;
  organization: OrganizationRef;
  eda_credential?: EdaCredentialRef | null;
  signature_validation_credential?: EdaCredentialRef | null;
  verify_ssl?: boolean;
  scm_branch?: string;
  scm_refspec?: string;
  proxy: string;
  id: number;
  url: string;
  scm_type: ScmTypeEnum;
  git_hash: string;
  import_state: ImportStateEnum;
  import_error: string | null;
  /** @format date-time */
  created_at: string;
  /** @format date-time */
  modified_at: string;
}

export interface ProjectRef {
  id: number;
  git_hash: string;
  url: string;
  /** * `git` - Git */
  scm_type?: ScmTypeEnum;
  name: string;
  description?: string;
  organization_id: number | null;
}

export interface Resource {
  object_id: string;
  name: string | null;
  /** @format uuid */
  ansible_id?: string;
  /** @format uuid */
  service_id?: string;
  resource_type?: string;
  has_serializer: boolean;
  resource_data: Record<string, any>;
  url: string;
}

export interface ResourceList {
  object_id: string;
  name: string | null;
  /** @format uuid */
  ansible_id?: string;
  /** @format uuid */
  service_id?: string;
  resource_type?: string;
  has_serializer: boolean;
  resource_data: Record<string, any>;
  url: string;
}

export interface ResourceType {
  id: number;
  name: string;
  externally_managed: boolean;
  shared_resource_type: string | null;
  url: string;
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

export interface RoleDefinition {
  id: number;
  url: string;
  related: Record<string, string>;
  summary_fields: Record<string, Record<string, any>>;
  permissions: PermissionsEnum[];
  /**
   * The type of resource this applies to
   *
   * * `eda.activation` - Activation
   * * `eda.auditrule` - Audit Rule
   * * `eda.credentialtype` - Credential Type
   * * `eda.decisionenvironment` - Decision Environment
   * * `eda.edacredential` - Eda Credential
   * * `eda.project` - Project
   * * `eda.rulebook` - Rulebook
   * * `eda.rulebookprocess` - Rulebook Process
   * * `shared.organization` - Organization
   * * `shared.team` - Team
   */
  content_type?: ContentTypeEnum | NullEnum | null;
  /**
   * The date/time this resource was created
   * @format date-time
   */
  modified: string;
  /**
   * The date/time this resource was created
   * @format date-time
   */
  created: string;
  name: string;
  description?: string;
  managed: boolean;
  /** The user who last modified this resource */
  modified_by: number | null;
  /** The user who created this resource */
  created_by: number | null;
}

export interface RoleDefinitionCreate {
  permissions: PermissionsEnum[];
  /**
   * The type of resource this applies to
   *
   * * `eda.activation` - Activation
   * * `eda.auditrule` - Audit Rule
   * * `eda.credentialtype` - Credential Type
   * * `eda.decisionenvironment` - Decision Environment
   * * `eda.edacredential` - Eda Credential
   * * `eda.project` - Project
   * * `eda.rulebook` - Rulebook
   * * `eda.rulebookprocess` - Rulebook Process
   * * `shared.organization` - Organization
   * * `shared.team` - Team
   */
  content_type?: ContentTypeEnum | NullEnum | null;
  name: string;
  description?: string;
}

export interface RoleDefinitionDetail {
  id: number;
  url: string;
  related: Record<string, string>;
  summary_fields: Record<string, Record<string, any>>;
  permissions: PermissionsEnum[];
  /**
   * The type of resource this applies to
   *
   * * `eda.activation` - Activation
   * * `eda.auditrule` - Audit Rule
   * * `eda.credentialtype` - Credential Type
   * * `eda.decisionenvironment` - Decision Environment
   * * `eda.edacredential` - Eda Credential
   * * `eda.project` - Project
   * * `eda.rulebook` - Rulebook
   * * `eda.rulebookprocess` - Rulebook Process
   * * `shared.organization` - Organization
   * * `shared.team` - Team
   */
  content_type: ContentTypeEnum;
  /**
   * The date/time this resource was created
   * @format date-time
   */
  modified: string;
  /**
   * The date/time this resource was created
   * @format date-time
   */
  created: string;
  name: string;
  description?: string;
  managed: boolean;
  /** The user who last modified this resource */
  modified_by: number | null;
  /** The user who created this resource */
  created_by: number | null;
}

export interface RoleTeamAssignment {
  id: number;
  url: string;
  related: Record<string, string>;
  summary_fields: Record<string, Record<string, any>>;
  /**
   * The date/time this resource was created
   * @format date-time
   */
  created: string;
  /** The user who created this resource */
  created_by: number | null;
  /**
   * The type of resource this applies to
   *
   * * `eda.activation` - Activation
   * * `eda.auditrule` - Audit Rule
   * * `eda.credentialtype` - Credential Type
   * * `eda.decisionenvironment` - Decision Environment
   * * `eda.edacredential` - Eda Credential
   * * `eda.project` - Project
   * * `eda.rulebook` - Rulebook
   * * `eda.rulebookprocess` - Rulebook Process
   * * `shared.organization` - Organization
   * * `shared.team` - Team
   */
  content_type: ContentTypeEnum;
  /** Primary key of the object this assignment applies to, null value indicates system-wide assignment */
  object_id?: string | null;
  /**
   * Resource id of the object this role applies to. Alternative to the object_id field.
   * @format uuid
   */
  object_ansible_id?: string;
  /** The role definition which defines permissions conveyed by this assignment */
  role_definition: number;
  team?: number;
  /**
   * Resource id of the team who will receive permissions from this assignment. Alternative to team field.
   * @format uuid
   */
  team_ansible_id?: string;
}

export interface RoleTeamAssignmentCreate {
  /** Primary key of the object this assignment applies to, null value indicates system-wide assignment */
  object_id?: string | null;
  /**
   * Resource id of the object this role applies to. Alternative to the object_id field.
   * @format uuid
   */
  object_ansible_id?: string;
  /** The role definition which defines permissions conveyed by this assignment */
  role_definition: number;
  team?: number;
  /**
   * Resource id of the team who will receive permissions from this assignment. Alternative to team field.
   * @format uuid
   */
  team_ansible_id?: string;
}

export interface RoleUserAssignment {
  id: number;
  url: string;
  related: Record<string, string>;
  summary_fields: Record<string, Record<string, any>>;
  /**
   * The date/time this resource was created
   * @format date-time
   */
  created: string;
  /** The user who created this resource */
  created_by: number | null;
  /**
   * The type of resource this applies to
   *
   * * `eda.activation` - Activation
   * * `eda.auditrule` - Audit Rule
   * * `eda.credentialtype` - Credential Type
   * * `eda.decisionenvironment` - Decision Environment
   * * `eda.edacredential` - Eda Credential
   * * `eda.project` - Project
   * * `eda.rulebook` - Rulebook
   * * `eda.rulebookprocess` - Rulebook Process
   * * `shared.organization` - Organization
   * * `shared.team` - Team
   */
  content_type: ContentTypeEnum;
  /** Primary key of the object this assignment applies to, null value indicates system-wide assignment */
  object_id?: string | null;
  /**
   * Resource id of the object this role applies to. Alternative to the object_id field.
   * @format uuid
   */
  object_ansible_id?: string;
  /** The role definition which defines permissions conveyed by this assignment */
  role_definition: number;
  user?: number;
  /**
   * Resource id of the user who will receive permissions from this assignment. Alternative to user field.
   * @format uuid
   */
  user_ansible_id?: string;
}

export interface RoleUserAssignmentCreate {
  /** Primary key of the object this assignment applies to, null value indicates system-wide assignment */
  object_id?: string | null;
  /**
   * Resource id of the object this role applies to. Alternative to the object_id field.
   * @format uuid
   */
  object_ansible_id?: string;
  /** The role definition which defines permissions conveyed by this assignment */
  role_definition: number;
  user?: number;
  /**
   * Resource id of the user who will receive permissions from this assignment. Alternative to user field.
   * @format uuid
   */
  user_ansible_id?: string;
}

export interface Rulebook {
  id: number;
  name: string;
  description?: string | null;
  rulesets?: string;
  /** ID of the project */
  project_id?: number | null;
  /** ID of the organization */
  organization_id: number;
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
  organization_id: number | null;
}

/** * `git` - Git */
export enum ScmTypeEnum {
  Git = 'git',
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
 * * `workers offline` - workers offline
 */
export enum StatusEnum {
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
  WorkersOffline = 'workers offline',
}

export interface Team {
  id: number;
  /**
   * The name of this resource
   * @maxLength 512
   */
  name: string;
  /** The team description. */
  description?: string;
  /** The organization of this team. */
  organization_id: number;
  resource: Record<string, any>;
  /**
   * The date/time this resource was created
   * @format date-time
   */
  created: string;
  /** The user who created this resource */
  created_by: number | null;
  /**
   * The date/time this resource was created
   * @format date-time
   */
  modified: string;
  /** The user who last modified this resource */
  modified_by: number | null;
}

export interface TeamCreate {
  /**
   * The name of this resource
   * @maxLength 512
   */
  name: string;
  /** The team description. */
  description?: string;
  organization_id?: number | null;
}

export interface TeamDetail {
  id: number;
  /**
   * The name of this resource
   * @maxLength 512
   */
  name: string;
  /** The team description. */
  description?: string;
  organization: OrganizationRef;
  resource: Record<string, any>;
  /**
   * The date/time this resource was created
   * @format date-time
   */
  created: string;
  /** The user who created this resource */
  created_by: number | null;
  /**
   * The date/time this resource was created
   * @format date-time
   */
  modified: string;
  /** The user who last modified this resource */
  modified_by: number | null;
}

export interface TokenRefresh {
  access: string;
  refresh: string;
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
  /**
   * Superuser status
   * Designates that this user has all permissions without explicitly assigning them.
   */
  is_superuser?: boolean;
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
  resource: Record<string, any>;
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
  resource: Record<string, any>;
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
      this.request<ActivationRead, void>({
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
      this.request<void, void>({
        path: `/activations/${id}/restart/`,
        method: 'POST',
        secure: true,
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
        /** Which field to use when ordering the results. */
        ordering?: string;
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
        /** Which field to use when ordering the results. */
        ordering?: string;
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
        /** Which field to use when ordering the results. */
        ordering?: string;
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

    /**
     * @description Takes a refresh type JSON web token and returns an access type JSON web token if the refresh token is valid.
     *
     * @tags auth
     * @name AuthTokenRefreshCreate
     * @request POST:/auth/token/refresh/
     */
    authTokenRefreshCreate: (data: TokenRefresh, params: RequestParams = {}) =>
      this.request<TokenRefresh, any>({
        path: `/auth/token/refresh/`,
        method: 'POST',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),
  };
  credentialTypes = {
    /**
     * @description List all credential types
     *
     * @tags credential-types
     * @name CredentialTypesList
     * @request GET:/credential-types/
     * @secure
     */
    credentialTypesList: (
      query?: {
        /** Filter by credential type name. */
        name?: string;
        /** A page number within the paginated result set. */
        page?: number;
        /** Number of results to return per page. */
        page_size?: number;
      },
      params: RequestParams = {}
    ) =>
      this.request<PaginatedCredentialTypeList, any>({
        path: `/credential-types/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Create a new credential type.
     *
     * @tags credential-types
     * @name CredentialTypesCreate
     * @request POST:/credential-types/
     * @secure
     */
    credentialTypesCreate: (data: CredentialTypeCreate, params: RequestParams = {}) =>
      this.request<CredentialType, any>({
        path: `/credential-types/`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Get credential type by id
     *
     * @tags credential-types
     * @name CredentialTypesRetrieve
     * @request GET:/credential-types/{id}/
     * @secure
     */
    credentialTypesRetrieve: (id: number, params: RequestParams = {}) =>
      this.request<CredentialType, any>({
        path: `/credential-types/${id}/`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Partial update of a credential type
     *
     * @tags credential-types
     * @name CredentialTypesPartialUpdate
     * @request PATCH:/credential-types/{id}/
     * @secure
     */
    credentialTypesPartialUpdate: (
      id: number,
      data: PatchedCredentialTypeCreate,
      params: RequestParams = {}
    ) =>
      this.request<CredentialType, any>({
        path: `/credential-types/${id}/`,
        method: 'PATCH',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Delete a credential type by id
     *
     * @tags credential-types
     * @name CredentialTypesDestroy
     * @request DELETE:/credential-types/{id}/
     * @secure
     */
    credentialTypesDestroy: (id: number, params: RequestParams = {}) =>
      this.request<void, void>({
        path: `/credential-types/${id}/`,
        method: 'DELETE',
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
  edaCredentials = {
    /**
     * @description List all EDA credentials
     *
     * @tags eda-credentials
     * @name EdaCredentialsList
     * @request GET:/eda-credentials/
     * @secure
     */
    edaCredentialsList: (
      query?: {
        /** Kind of CredentialType */
        credential_type__kind?: string;
        /** Filter by Credential Type ID. */
        credential_type_id?: number;
        /** Filter by EDA credential name. */
        name?: string;
        /** A page number within the paginated result set. */
        page?: number;
        /** Number of results to return per page. */
        page_size?: number;
      },
      params: RequestParams = {}
    ) =>
      this.request<PaginatedEdaCredentialList, any>({
        path: `/eda-credentials/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Create a new EDA credential.
     *
     * @tags eda-credentials
     * @name EdaCredentialsCreate
     * @request POST:/eda-credentials/
     * @secure
     */
    edaCredentialsCreate: (data: EdaCredentialCreate, params: RequestParams = {}) =>
      this.request<EdaCredential, any>({
        path: `/eda-credentials/`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Get EDA credential by id
     *
     * @tags eda-credentials
     * @name EdaCredentialsRetrieve
     * @request GET:/eda-credentials/{id}/
     * @secure
     */
    edaCredentialsRetrieve: (
      id: number,
      query?: {
        /** Query resources that have reference to the credential by its id */
        refs?: 'false' | 'true';
      },
      params: RequestParams = {}
    ) =>
      this.request<EdaCredential, any>({
        path: `/eda-credentials/${id}/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Partial update of an EDA credential
     *
     * @tags eda-credentials
     * @name EdaCredentialsPartialUpdate
     * @request PATCH:/eda-credentials/{id}/
     * @secure
     */
    edaCredentialsPartialUpdate: (
      id: number,
      data: PatchedEdaCredentialCreate,
      params: RequestParams = {}
    ) =>
      this.request<EdaCredential, any>({
        path: `/eda-credentials/${id}/`,
        method: 'PATCH',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Delete an eda credential by id
     *
     * @tags eda-credentials
     * @name EdaCredentialsDestroy
     * @request DELETE:/eda-credentials/{id}/
     * @secure
     */
    edaCredentialsDestroy: (
      id: number,
      query?: {
        /** Force deletion if there are dependent objects */
        force?: boolean;
      },
      params: RequestParams = {}
    ) =>
      this.request<void, any>({
        path: `/eda-credentials/${id}/`,
        method: 'DELETE',
        query: query,
        secure: true,
        ...params,
      }),
  };
  organizations = {
    /**
     * @description List all organizations.
     *
     * @tags organizations
     * @name OrganizationsList
     * @request GET:/organizations/
     * @secure
     */
    organizationsList: (
      query?: {
        /** Filter by organization description. */
        description?: string;
        /** Filter by organization name. */
        name?: string;
        /** A page number within the paginated result set. */
        page?: number;
        /** Number of results to return per page. */
        page_size?: number;
        /** Filter by resource ansible ID. */
        resource__ansible_id?: string;
      },
      params: RequestParams = {}
    ) =>
      this.request<PaginatedOrganizationList, any>({
        path: `/organizations/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Create a new organization
     *
     * @tags organizations
     * @name OrganizationsCreate
     * @request POST:/organizations/
     * @secure
     */
    organizationsCreate: (data: OrganizationCreate, params: RequestParams = {}) =>
      this.request<Organization, any>({
        path: `/organizations/`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags organizations
     * @name OrganizationsRetrieve
     * @request GET:/organizations/{id}/
     * @secure
     */
    organizationsRetrieve: (id: number, params: RequestParams = {}) =>
      this.request<Organization, any>({
        path: `/organizations/${id}/`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Partially update an organization
     *
     * @tags organizations
     * @name OrganizationsPartialUpdate
     * @request PATCH:/organizations/{id}/
     * @secure
     */
    organizationsPartialUpdate: (
      id: number,
      data: PatchedOrganizationCreate,
      params: RequestParams = {}
    ) =>
      this.request<Organization, any>({
        path: `/organizations/${id}/`,
        method: 'PATCH',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Delete an organization by id
     *
     * @tags organizations
     * @name OrganizationsDestroy
     * @request DELETE:/organizations/{id}/
     * @secure
     */
    organizationsDestroy: (id: number, params: RequestParams = {}) =>
      this.request<void, void>({
        path: `/organizations/${id}/`,
        method: 'DELETE',
        secure: true,
        ...params,
      }),

    /**
     * @description List all teams of the organization
     *
     * @tags organizations
     * @name OrganizationsTeamsList
     * @request GET:/organizations/{id}/teams/
     * @secure
     */
    organizationsTeamsList: (
      id: number,
      query?: {
        /** Filter by team description. */
        description?: string;
        /** Filter by team name. */
        name?: string;
        /** A page number within the paginated result set. */
        page?: number;
        /** Number of results to return per page. */
        page_size?: number;
        /** Filter by resource ansible ID. */
        resource__ansible_id?: string;
      },
      params: RequestParams = {}
    ) =>
      this.request<PaginatedTeamList, any>({
        path: `/organizations/${id}/teams/`,
        method: 'GET',
        query: query,
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
  roleDefinitions = {
    /**
     * @description Role Definitions (roles) contain a list of permissions and can be used to assign those permissions to a user or team through the respective assignment endpoints. Custom roles can be created, modified, and deleted through this endpoint. System-managed roles are shown here, which cannot be edited or deleted, but can be assigned to users.
     *
     * @tags role_definitions
     * @name RoleDefinitionsList
     * @request GET:/role_definitions/
     * @secure
     */
    roleDefinitionsList: (
      query?: {
        /** A page number within the paginated result set. */
        page?: number;
        /** Number of results to return per page. */
        page_size?: number;
        /** A search term. */
        search?: string;
      },
      params: RequestParams = {}
    ) =>
      this.request<PaginatedRoleDefinitionList, any>({
        path: `/role_definitions/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Create a RoleDefinition.
     *
     * @tags role_definitions
     * @name RoleDefinitionsCreate
     * @request POST:/role_definitions/
     * @secure
     */
    roleDefinitionsCreate: (data: RoleDefinitionCreate, params: RequestParams = {}) =>
      this.request<RoleDefinition, any>({
        path: `/role_definitions/`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Role Definitions (roles) contain a list of permissions and can be used to assign those permissions to a user or team through the respective assignment endpoints. Custom roles can be created, modified, and deleted through this endpoint. System-managed roles are shown here, which cannot be edited or deleted, but can be assigned to users.
     *
     * @tags role_definitions
     * @name RoleDefinitionsRetrieve
     * @request GET:/role_definitions/{id}/
     * @secure
     */
    roleDefinitionsRetrieve: (id: number, params: RequestParams = {}) =>
      this.request<RoleDefinition, any>({
        path: `/role_definitions/${id}/`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Role Definitions (roles) contain a list of permissions and can be used to assign those permissions to a user or team through the respective assignment endpoints. Custom roles can be created, modified, and deleted through this endpoint. System-managed roles are shown here, which cannot be edited or deleted, but can be assigned to users.
     *
     * @tags role_definitions
     * @name RoleDefinitionsUpdate
     * @request PUT:/role_definitions/{id}/
     * @secure
     */
    roleDefinitionsUpdate: (id: number, data: RoleDefinitionDetail, params: RequestParams = {}) =>
      this.request<RoleDefinitionDetail, any>({
        path: `/role_definitions/${id}/`,
        method: 'PUT',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Role Definitions (roles) contain a list of permissions and can be used to assign those permissions to a user or team through the respective assignment endpoints. Custom roles can be created, modified, and deleted through this endpoint. System-managed roles are shown here, which cannot be edited or deleted, but can be assigned to users.
     *
     * @tags role_definitions
     * @name RoleDefinitionsPartialUpdate
     * @request PATCH:/role_definitions/{id}/
     * @secure
     */
    roleDefinitionsPartialUpdate: (
      id: number,
      data: PatchedRoleDefinition,
      params: RequestParams = {}
    ) =>
      this.request<RoleDefinition, any>({
        path: `/role_definitions/${id}/`,
        method: 'PATCH',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Role Definitions (roles) contain a list of permissions and can be used to assign those permissions to a user or team through the respective assignment endpoints. Custom roles can be created, modified, and deleted through this endpoint. System-managed roles are shown here, which cannot be edited or deleted, but can be assigned to users.
     *
     * @tags role_definitions
     * @name RoleDefinitionsDestroy
     * @request DELETE:/role_definitions/{id}/
     * @secure
     */
    roleDefinitionsDestroy: (id: number, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/role_definitions/${id}/`,
        method: 'DELETE',
        secure: true,
        ...params,
      }),

    /**
     * @description Use this endpoint to give a team permission to a resource or an organization. The needed data is the user, the role definition, and the object id. The object must be of the type specified in the role definition. The type given in the role definition and the provided object_id are used to look up the resource. After creation, the assignment cannot be edited, but can be deleted to remove those permissions.
     *
     * @tags role_definitions
     * @name RoleDefinitionsTeamAssignmentsList
     * @request GET:/role_definitions/{id}/team_assignments/
     * @secure
     */
    roleDefinitionsTeamAssignmentsList: (
      id: string,
      query?: {
        /** A page number within the paginated result set. */
        page?: number;
        /** Number of results to return per page. */
        page_size?: number;
        /** A search term. */
        search?: string;
      },
      params: RequestParams = {}
    ) =>
      this.request<PaginatedRoleTeamAssignmentList, any>({
        path: `/role_definitions/${id}/team_assignments/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Use this endpoint to give a team permission to a resource or an organization. The needed data is the user, the role definition, and the object id. The object must be of the type specified in the role definition. The type given in the role definition and the provided object_id are used to look up the resource. After creation, the assignment cannot be edited, but can be deleted to remove those permissions.
     *
     * @tags role_definitions
     * @name RoleDefinitionsTeamAssignmentsRetrieve
     * @request GET:/role_definitions/{id}/team_assignments/{team_assignments}/
     * @secure
     */
    roleDefinitionsTeamAssignmentsRetrieve: (
      id: string,
      teamAssignments: string,
      params: RequestParams = {}
    ) =>
      this.request<RoleTeamAssignment, any>({
        path: `/role_definitions/${id}/team_assignments/${teamAssignments}/`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Use this endpoint to give a user permission to a resource or an organization. The needed data is the team, the role definition, and the object id. The object must be of the type specified in the role definition. The type given in the role definition and the provided object_id are used to look up the resource. After creation, the assignment cannot be edited, but can be deleted to remove those permissions.
     *
     * @tags role_definitions
     * @name RoleDefinitionsUserAssignmentsList
     * @request GET:/role_definitions/{id}/user_assignments/
     * @secure
     */
    roleDefinitionsUserAssignmentsList: (
      id: string,
      query?: {
        /** A page number within the paginated result set. */
        page?: number;
        /** Number of results to return per page. */
        page_size?: number;
        /** A search term. */
        search?: string;
      },
      params: RequestParams = {}
    ) =>
      this.request<PaginatedRoleUserAssignmentList, any>({
        path: `/role_definitions/${id}/user_assignments/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Use this endpoint to give a user permission to a resource or an organization. The needed data is the team, the role definition, and the object id. The object must be of the type specified in the role definition. The type given in the role definition and the provided object_id are used to look up the resource. After creation, the assignment cannot be edited, but can be deleted to remove those permissions.
     *
     * @tags role_definitions
     * @name RoleDefinitionsUserAssignmentsRetrieve
     * @request GET:/role_definitions/{id}/user_assignments/{user_assignments}/
     * @secure
     */
    roleDefinitionsUserAssignmentsRetrieve: (
      id: string,
      userAssignments: string,
      params: RequestParams = {}
    ) =>
      this.request<RoleUserAssignment, any>({
        path: `/role_definitions/${id}/user_assignments/${userAssignments}/`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),
  };
  roleTeamAssignments = {
    /**
     * @description Use this endpoint to give a team permission to a resource or an organization. The needed data is the user, the role definition, and the object id. The object must be of the type specified in the role definition. The type given in the role definition and the provided object_id are used to look up the resource. After creation, the assignment cannot be edited, but can be deleted to remove those permissions.
     *
     * @tags role_team_assignments
     * @name RoleTeamAssignmentsList
     * @request GET:/role_team_assignments/
     * @secure
     */
    roleTeamAssignmentsList: (
      query?: {
        /** A page number within the paginated result set. */
        page?: number;
        /** Number of results to return per page. */
        page_size?: number;
        /** A search term. */
        search?: string;
      },
      params: RequestParams = {}
    ) =>
      this.request<PaginatedRoleTeamAssignmentList, any>({
        path: `/role_team_assignments/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Create a RoleTeamAssignment.
     *
     * @tags role_team_assignments
     * @name RoleTeamAssignmentsCreate
     * @request POST:/role_team_assignments/
     * @secure
     */
    roleTeamAssignmentsCreate: (data: RoleTeamAssignmentCreate, params: RequestParams = {}) =>
      this.request<RoleTeamAssignment, any>({
        path: `/role_team_assignments/`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Use this endpoint to give a team permission to a resource or an organization. The needed data is the user, the role definition, and the object id. The object must be of the type specified in the role definition. The type given in the role definition and the provided object_id are used to look up the resource. After creation, the assignment cannot be edited, but can be deleted to remove those permissions.
     *
     * @tags role_team_assignments
     * @name RoleTeamAssignmentsRetrieve
     * @request GET:/role_team_assignments/{id}/
     * @secure
     */
    roleTeamAssignmentsRetrieve: (id: number, params: RequestParams = {}) =>
      this.request<RoleTeamAssignment, any>({
        path: `/role_team_assignments/${id}/`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Use this endpoint to give a team permission to a resource or an organization. The needed data is the user, the role definition, and the object id. The object must be of the type specified in the role definition. The type given in the role definition and the provided object_id are used to look up the resource. After creation, the assignment cannot be edited, but can be deleted to remove those permissions.
     *
     * @tags role_team_assignments
     * @name RoleTeamAssignmentsDestroy
     * @request DELETE:/role_team_assignments/{id}/
     * @secure
     */
    roleTeamAssignmentsDestroy: (id: number, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/role_team_assignments/${id}/`,
        method: 'DELETE',
        secure: true,
        ...params,
      }),
  };
  roleUserAssignments = {
    /**
     * @description Use this endpoint to give a user permission to a resource or an organization. The needed data is the team, the role definition, and the object id. The object must be of the type specified in the role definition. The type given in the role definition and the provided object_id are used to look up the resource. After creation, the assignment cannot be edited, but can be deleted to remove those permissions.
     *
     * @tags role_user_assignments
     * @name RoleUserAssignmentsList
     * @request GET:/role_user_assignments/
     * @secure
     */
    roleUserAssignmentsList: (
      query?: {
        /** A page number within the paginated result set. */
        page?: number;
        /** Number of results to return per page. */
        page_size?: number;
        /** A search term. */
        search?: string;
      },
      params: RequestParams = {}
    ) =>
      this.request<PaginatedRoleUserAssignmentList, any>({
        path: `/role_user_assignments/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Create a RoleUserAssignment.
     *
     * @tags role_user_assignments
     * @name RoleUserAssignmentsCreate
     * @request POST:/role_user_assignments/
     * @secure
     */
    roleUserAssignmentsCreate: (data: RoleUserAssignmentCreate, params: RequestParams = {}) =>
      this.request<RoleUserAssignment, any>({
        path: `/role_user_assignments/`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Use this endpoint to give a user permission to a resource or an organization. The needed data is the team, the role definition, and the object id. The object must be of the type specified in the role definition. The type given in the role definition and the provided object_id are used to look up the resource. After creation, the assignment cannot be edited, but can be deleted to remove those permissions.
     *
     * @tags role_user_assignments
     * @name RoleUserAssignmentsRetrieve
     * @request GET:/role_user_assignments/{id}/
     * @secure
     */
    roleUserAssignmentsRetrieve: (id: number, params: RequestParams = {}) =>
      this.request<RoleUserAssignment, any>({
        path: `/role_user_assignments/${id}/`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Use this endpoint to give a user permission to a resource or an organization. The needed data is the team, the role definition, and the object id. The object must be of the type specified in the role definition. The type given in the role definition and the provided object_id are used to look up the resource. After creation, the assignment cannot be edited, but can be deleted to remove those permissions.
     *
     * @tags role_user_assignments
     * @name RoleUserAssignmentsDestroy
     * @request DELETE:/role_user_assignments/{id}/
     * @secure
     */
    roleUserAssignmentsDestroy: (id: number, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/role_user_assignments/${id}/`,
        method: 'DELETE',
        secure: true,
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
  serviceIndex = {
    /**
     * @description Link other resource registry endpoints
     *
     * @tags service-index
     * @name ServiceIndexRetrieve
     * @request GET:/service-index/
     * @secure
     */
    serviceIndexRetrieve: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/service-index/`,
        method: 'GET',
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags service-index
     * @name ServiceIndexMetadataRetrieve
     * @request GET:/service-index/metadata/
     * @secure
     */
    serviceIndexMetadataRetrieve: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/service-index/metadata/`,
        method: 'GET',
        secure: true,
        ...params,
      }),

    /**
     * @description Index of the resource types that are configured in the system.
     *
     * @tags service-index
     * @name ServiceIndexResourceTypesList
     * @request GET:/service-index/resource-types/
     * @secure
     */
    serviceIndexResourceTypesList: (
      query?: {
        /** A page number within the paginated result set. */
        page?: number;
      },
      params: RequestParams = {}
    ) =>
      this.request<PaginatedResourceTypeList, any>({
        path: `/service-index/resource-types/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Index of the resource types that are configured in the system.
     *
     * @tags service-index
     * @name ServiceIndexResourceTypesRetrieve
     * @request GET:/service-index/resource-types/{name}/
     * @secure
     */
    serviceIndexResourceTypesRetrieve: (name: string, params: RequestParams = {}) =>
      this.request<ResourceType, any>({
        path: `/service-index/resource-types/${name}/`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Returns the as a stream the csv of resource_id,hash for a given resource type.
     *
     * @tags service-index
     * @name ServiceIndexResourceTypesManifestRetrieve
     * @request GET:/service-index/resource-types/{name}/manifest/
     * @secure
     */
    serviceIndexResourceTypesManifestRetrieve: (name: string, params: RequestParams = {}) =>
      this.request<ResourceType, any>({
        path: `/service-index/resource-types/${name}/manifest/`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Index of all the resources in the system.
     *
     * @tags service-index
     * @name ServiceIndexResourcesList
     * @request GET:/service-index/resources/
     * @secure
     */
    serviceIndexResourcesList: (
      query?: {
        /** A page number within the paginated result set. */
        page?: number;
      },
      params: RequestParams = {}
    ) =>
      this.request<PaginatedResourceListList, any>({
        path: `/service-index/resources/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Index of all the resources in the system.
     *
     * @tags service-index
     * @name ServiceIndexResourcesCreate
     * @request POST:/service-index/resources/
     * @secure
     */
    serviceIndexResourcesCreate: (data: Resource, params: RequestParams = {}) =>
      this.request<Resource, any>({
        path: `/service-index/resources/`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Index of all the resources in the system.
     *
     * @tags service-index
     * @name ServiceIndexResourcesRetrieve
     * @request GET:/service-index/resources/{ansible_id}/
     * @secure
     */
    serviceIndexResourcesRetrieve: (ansibleId: string, params: RequestParams = {}) =>
      this.request<Resource, any>({
        path: `/service-index/resources/${ansibleId}/`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Index of all the resources in the system.
     *
     * @tags service-index
     * @name ServiceIndexResourcesUpdate
     * @request PUT:/service-index/resources/{ansible_id}/
     * @secure
     */
    serviceIndexResourcesUpdate: (ansibleId: string, data: Resource, params: RequestParams = {}) =>
      this.request<Resource, any>({
        path: `/service-index/resources/${ansibleId}/`,
        method: 'PUT',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Index of all the resources in the system.
     *
     * @tags service-index
     * @name ServiceIndexResourcesPartialUpdate
     * @request PATCH:/service-index/resources/{ansible_id}/
     * @secure
     */
    serviceIndexResourcesPartialUpdate: (
      ansibleId: string,
      data: PatchedResource,
      params: RequestParams = {}
    ) =>
      this.request<Resource, any>({
        path: `/service-index/resources/${ansibleId}/`,
        method: 'PATCH',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Index of all the resources in the system.
     *
     * @tags service-index
     * @name ServiceIndexResourcesDestroy
     * @request DELETE:/service-index/resources/{ansible_id}/
     * @secure
     */
    serviceIndexResourcesDestroy: (ansibleId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/service-index/resources/${ansibleId}/`,
        method: 'DELETE',
        secure: true,
        ...params,
      }),

    /**
     * @description Index of all the resources in the system.
     *
     * @tags service-index
     * @name ServiceIndexResourcesAdditionalDataRetrieve
     * @request GET:/service-index/resources/{ansible_id}/additional_data/
     * @secure
     */
    serviceIndexResourcesAdditionalDataRetrieve: (ansibleId: string, params: RequestParams = {}) =>
      this.request<Resource, any>({
        path: `/service-index/resources/${ansibleId}/additional_data/`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Validate a user's username and password.
     *
     * @tags service-index
     * @name ServiceIndexValidateLocalAccountCreate
     * @request POST:/service-index/validate-local-account/
     * @secure
     */
    serviceIndexValidateLocalAccountCreate: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/service-index/validate-local-account/`,
        method: 'POST',
        secure: true,
        ...params,
      }),
  };
  status = {
    /**
     * No description
     *
     * @tags status
     * @name StatusRetrieve
     * @request GET:/status/
     * @secure
     */
    statusRetrieve: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/status/`,
        method: 'GET',
        secure: true,
        ...params,
      }),
  };
  teams = {
    /**
     * @description List all teams.
     *
     * @tags teams
     * @name TeamsList
     * @request GET:/teams/
     * @secure
     */
    teamsList: (
      query?: {
        /** Filter by team description. */
        description?: string;
        /** Filter by team name. */
        name?: string;
        /** Filter by organization ID. */
        organization_id?: number;
        /** A page number within the paginated result set. */
        page?: number;
        /** Number of results to return per page. */
        page_size?: number;
        /** Filter by resource ansible ID. */
        resource__ansible_id?: string;
      },
      params: RequestParams = {}
    ) =>
      this.request<PaginatedTeamList, any>({
        path: `/teams/`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Create a new team
     *
     * @tags teams
     * @name TeamsCreate
     * @request POST:/teams/
     * @secure
     */
    teamsCreate: (data: TeamCreate, params: RequestParams = {}) =>
      this.request<Team, any>({
        path: `/teams/`,
        method: 'POST',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description Get team by its id
     *
     * @tags teams
     * @name TeamsRetrieve
     * @request GET:/teams/{id}/
     * @secure
     */
    teamsRetrieve: (id: number, params: RequestParams = {}) =>
      this.request<TeamDetail, any>({
        path: `/teams/${id}/`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Partially update a team
     *
     * @tags teams
     * @name TeamsPartialUpdate
     * @request PATCH:/teams/{id}/
     * @secure
     */
    teamsPartialUpdate: (id: number, data: PatchedTeamUpdate, params: RequestParams = {}) =>
      this.request<Team, any>({
        path: `/teams/${id}/`,
        method: 'PATCH',
        body: data,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags teams
     * @name TeamsDestroy
     * @request DELETE:/teams/{id}/
     * @secure
     */
    teamsDestroy: (id: number, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/teams/${id}/`,
        method: 'DELETE',
        secure: true,
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
        /** Filter by resource ansible ID. */
        resource__ansible_id?: string;
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
