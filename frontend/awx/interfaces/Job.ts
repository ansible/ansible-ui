/* eslint-disable @typescript-eslint/ban-types */
/* tslint:disable */
/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */

export interface Job {
  id: number;
  type: string;
  url: string;
  related: {
    created_by?: string;
    labels: string;
    inventory: string;
    project: string;
    organization: string;
    credentials: string;
    unified_job_template?: string;
    stdout: string;
    execution_environment: string;
    job_events: string;
    job_host_summaries: string;
    activity_stream: string;
    notifications: string;
    create_schedule: string;
    job_template?: string;
    cancel: string;
    project_update?: string;
    relaunch: string;
    source_workflow_job?: string;
    schedule?: string;
  };
  summary_fields: {
    organization: {
      id: number;
      name: string;
      description: string;
    };
    inventory: {
      id: number;
      name: string;
      description: string;
      has_active_failures: boolean;
      total_hosts: number;
      hosts_with_active_failures: number;
      total_groups: number;
      has_inventory_sources: boolean;
      total_inventory_sources: number;
      inventory_sources_with_failures: number;
      organization_id: number;
      kind: string;
    };
    execution_environment: {
      id: number;
      name: string;
      description: string;
      image: string;
    };
    project: {
      id: number;
      name: string;
      description: string;
      status: string;
      scm_type: string;
      allow_override: boolean;
    };
    project_update?: {
      id: number;
      name: string;
      description: string;
      status: string;
      failed: boolean;
    };
    job_template?: {
      id: number;
      name: string;
      description: string;
    };
    unified_job_template?: {
      id: number;
      name: string;
      description: string;
      unified_job_type: string;
    };
    instance_group: {
      id: number;
      name: string;
      is_container_group: boolean;
    };
    created_by?: {
      id: number;
      username: string;
      first_name: string;
      last_name: string;
    };
    user_capabilities: {
      delete: boolean;
      start: boolean;
    };
    labels: {
      count: number;
      results: unknown[];
    };
    credentials: {
      id: number;
      name: string;
      description: string;
      kind: string;
      cloud: boolean;
    }[];
    source_workflow_job?: {
      id: number;
      name: string;
      description: string;
      status: string;
      failed: boolean;
      elapsed: number;
    };
    schedule?: {
      id: number;
      name: string;
      description: string;
      next_run: string;
    };
  };
  created: string;
  modified: string;
  name: string;
  description: string;
  unified_job_template: number | null;
  launch_type: string;
  status: string;
  execution_environment: number;
  failed: boolean;
  started: string;
  finished: string;
  canceled_on: null;
  elapsed: number;
  job_explanation: string;
  execution_node: string;
  controller_node: string;
  launched_by: {
    id: number;
    name: string;
    type: string;
    url: string;
  };
  work_unit_id: string;
  job_type: string;
  inventory: number;
  project: number;
  playbook: string;
  scm_branch: string;
  forks: number;
  limit: string;
  verbosity: number;
  extra_vars: string;
  job_tags: string;
  force_handlers: boolean;
  skip_tags: string;
  start_at_task: string;
  timeout: number;
  use_fact_cache: boolean;
  organization: number;
  job_template: number | null;
  passwords_needed_to_start: unknown[];
  allow_simultaneous: boolean;
  artifacts: {};
  scm_revision: string;
  instance_group: number;
  diff_mode: boolean;
  job_slice_number: number;
  job_slice_count: number;
  webhook_service: string;
  webhook_credential: null;
  webhook_guid: string;
  playbook_counts: { play_count: number; task_count: number };
  host_status_counts: { ok: number; failures: number };
}
