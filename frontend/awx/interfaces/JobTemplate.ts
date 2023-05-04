import { JobTemplate as SwaggerJobTemplate } from './generated-from-swagger/api';
import { Label } from './Label';

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
  > {
  id: number;
  extra_vars: string;
  type: 'job_template';
  job_type: 'run' | 'check';
  url: string;
  created: string;
  modified: string;
  name: string;
  status: string;
  verbosity: 0 | 1 | 2 | 3 | 4 | 5;
  job_tags: string | '';
  skip_tags: string | '';
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
    project: {
      id: number;
      name: string;
      description: string;
      status: string;
      scm_type: string;
      allow_override: boolean;
    };
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
    credentials: Credential[];
    webhook_credential?: {
      id: number;
      name: string;
    };
  };
  webhook_credential?: number;
  webhook_url: string;
  webhook_key: string;
  webhook_service?: 'github' | 'gitlab';
  project: number;
}
