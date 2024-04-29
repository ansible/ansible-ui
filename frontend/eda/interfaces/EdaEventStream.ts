import {
  DecisionEnvironmentRef,
  EdaCredentialRef,
  LogLevelEnum,
  ProjectRef,
  RestartPolicyEnum,
  RulebookRef,
  StatusEnum,
} from './generated/eda-api';
import { EventStreamInstance } from './EdaEventStreamInstance';

export type EdaEventStream = EventStreamRead;
export type EdaEventStreamCreate = EventStreamCreate;
export type EdaEventStreamStatus = StatusEnum;

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
  credentials?: EdaCredentialRef[];
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
  status?: StatusEnum;
  git_hash?: string;
  project?: ProjectRef | null;
  rulebook?: RulebookRef | null;
  extra_var?: string | null;
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
  status?: StatusEnum;
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
