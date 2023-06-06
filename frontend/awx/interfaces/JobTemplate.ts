import { JobTemplate as SwaggerJobTemplate } from './generated-from-swagger/api';
import { Label } from './Label';
import { Project } from './Project';
import { SummaryFieldCredential } from './summary-fields/summary-fields';

export interface RecentJob {
  id: number;
  status: string;
  finished: string;
  canceled_on: string;
  type: string;
}

export interface JobTemplate
  extends Omit<
    SwaggerJobTemplate,
    | 'id'
    | 'name'
    | 'summary_fields'
    | 'related'
    | 'status'
    | 'job_type'
    | 'verbosity'
    | 'job_tags'
    | 'skip_tags'
    | 'project'
    | 'allow_simultaneous'
    | 'ask_credential_on_launch'
    | 'ask_diff_mode_on_launch'
    | 'ask_evecution_environment_on_launch'
    | 'ask_forks_on_launch'
    | 'ask_instance_groups_on_launch'
    | 'ask_inventory_on_launch'
    | 'ask_job_slice_count_on_launch'
    | 'ask_job_type_on_launch'
    | 'ask_labels_on_launch'
    | 'ask_limit_on_launch'
    | 'ask_scm_branch_on_launch'
    | 'ask_skip_tags_on_launch'
    | 'ask_tags_on_launch'
    | 'ask_timeout_on_launch'
    | 'ask_variables_on_launch'
    | 'ask_verbosity_on_launch'
    | 'become_enabled'
    | 'diff_mode'
    | 'forks'
    | 'host_config_key'
    | 'webhook_credential'
  > {
  id: number;
  host_config_key?: string;
  description?: string;
  extra_vars: string;
  diff_mode: boolean;
  forks: number;
  become_enabled: boolean;
  ask_variables_on_launch: boolean;
  ask_verbosity_on_launch: boolean;
  ask_scm_branch_on_launch: boolean;
  ask_skip_tags_on_launch: boolean;
  ask_timeout_on_launch: boolean;
  ask_tags_on_launch: boolean;
  allow_simultaneous: boolean;
  ask_labels_on_launch: boolean;
  ask_limit_on_launch: boolean;
  ask_job_slice_count_on_launch: boolean;
  ask_job_type_on_launch: boolean;
  ask_credential_on_launch: boolean;
  ask_diff_mode_on_launch: boolean;
  ask_forks_on_launch: boolean;
  ask_instance_groups_on_launch: boolean;
  ask_execution_environment_on_launch: boolean;
  ask_inventory_on_launch: boolean;
  type: 'job_template';
  job_type: 'run' | 'check';
  url: string;
  created: string;
  modified: string;
  name: string;
  status: string;
  verbosity: 0 | 1 | 2 | 3 | 4 | 5;
  job_tags: string;
  skip_tags: string;
  execution_environment?: number;
  related: {
    callback: string;
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
    project: Pick<Project, 'id' | 'name'>;
    execution_environment?: { id: number; name: string };
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
      results: Label[];
    };
    resolved_environment: {
      id: number;
      name: string;
      description: string;
      image: string;
    };
    recent_jobs: RecentJob[];
    credentials: SummaryFieldCredential[] | [];
    webhook_credential?: SummaryFieldCredential;
  };
  webhook_credential: number | null;
  webhook_url: string;
  webhook_key: string;
  webhook_service?: 'github' | 'gitlab';
  project: number;
}
