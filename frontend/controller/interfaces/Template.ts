interface RecentJob {
  id: number;
  status: string;
  finished: string;
  canceled_on: string;
  type: string;
}

interface Credential {
  id: number;
  name: string;
  description: string;
  kind: string;
  cloud: boolean;
}

export interface Template {
  id: number;
  type: string;
  url: string;
  related: {
    named_url: string;
    created_by: string;
    modified_by: string;
    labels: string;
    inventory: string;
    project: string;
    organization: string;
    credentials: string;
    last_job: string;
    jobs: string;
    schedules: string;
    activity_stream: string;
    launch: string;
    webhook_key: string;
    webhook_receiver: string;
    notification_templates_started: string;
    notification_templates_success: string;
    notification_templates_error: string;
    access_list: string;
    survey_spec: string;
    object_roles: string;
    instance_groups: string;
    slice_workflow_jobs: string;
    copy: string;
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
    project: {
      id: number;
      name: string;
      description: string;
      status: string;
      scm_type: string;
      allow_override: boolean;
    };
    last_job: {
      id: number;
      name: string;
      description: string;
      finished: string;
      status: string;
      failed: boolean;
    };
    last_update: {
      id: number;
      name: string;
      description: string;
      status: string;
      failed: boolean;
    };
    created_by: {
      id: number;
      username: string;
      first_name: string;
      last_name: string;
    };
    modified_by: {
      id: number;
      username: string;
      first_name: string;
      last_name: string;
    };
    object_roles: {
      admin_role: {
        description: string;
        name: string;
        id: number;
      };
      execute_role: {
        description: string;
        name: string;
        id: number;
      };
      read_role: {
        description: string;
        name: string;
        id: number;
      };
    };
    user_capabilities: {
      edit: boolean;
      delete: boolean;
      start: boolean;
      schedule: boolean;
      copy: boolean;
    };
    labels: {
      count: number;
      results: string[];
    };
    resolved_environment: {
      id: number;
      name: string;
      description: string;
      image: string;
    };
    recent_jobs: RecentJob[];
    credentials: Credential[];
    webhook_credential: {
      id: number;
      name: string;
    };
  };
  created: string;
  modified: string;
  name: string;
  description: string;
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
  last_job_run: string;
  last_job_failed: boolean;
  next_job_run: string;
  status: string;
  execution_environment: number;
  host_config_key: string;
  ask_scm_branch_on_launch: boolean;
  ask_diff_mode_on_launch: boolean;
  ask_variables_on_launch: boolean;
  ask_limit_on_launch: boolean;
  ask_tags_on_launch: boolean;
  ask_skip_tags_on_launch: boolean;
  ask_job_type_on_launch: boolean;
  ask_verbosity_on_launch: boolean;
  ask_inventory_on_launch: boolean;
  ask_credential_on_launch: boolean;
  ask_execution_environment_on_launch: boolean;
  ask_labels_on_launch: boolean;
  ask_forks_on_launch: boolean;
  ask_job_slice_count_on_launch: boolean;
  ask_timeout_on_launch: boolean;
  ask_instance_groups_on_launch: boolean;
  survey_enabled: boolean;
  become_enabled: boolean;
  diff_mode: boolean;
  allow_simultaneous: boolean;
  custom_virtualenv: string;
  job_slice_count: number;
  webhook_service: string;
  webhook_credential: string;
  prevent_instance_group_fallback: boolean;
}
