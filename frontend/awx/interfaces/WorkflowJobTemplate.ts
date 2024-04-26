import { Project } from './Project';
import { WorkflowJobTemplate as SwaggerWorkflowJobTemplate } from './generated-from-swagger/api';
import { SummaryFieldCredential, SummaryFieldsByUser } from './summary-fields/summary-fields';

export interface WorkflowJobTemplate
  extends Omit<
    SwaggerWorkflowJobTemplate,
    | 'id'
    | 'name'
    | 'description'
    | 'summary_fields'
    | 'job_type'
    | 'type'
    | 'related'
    | 'webhook_service'
    | 'status'
    | 'last_job_run'
    | 'next_job_run'
    | 'last_job_failed'
    | 'user_capabilities'
  > {
  id: number;
  organization: number | null;
  name: string;
  description: string;
  inventory: number | null;
  type: 'workflow_job_template';
  created: string;
  allow_simultaneous: boolean;
  modified: string;
  webhook_service: string;
  skip_tags: string;
  job_tags: string;
  webhook_credential: number | null;
  extra_vars: string;
  last_job_run: string | null;
  last_job_failed: boolean;
  next_job_run: string | null;
  status: string;
  related: {
    schedules: string;
    survey_spec: string;
    webhook_receiver: string;
    webhook_key: string;
  };
  summary_fields: {
    webhook_credential?: SummaryFieldCredential;
    labels: { count: number; results: { id: number; name: string }[] };
    inventory?: {
      name: string;
      id: number;
      description: string;
      has_active_failures: boolean;
      total_hosts: number;
      hosts_with_active_failures: number;
      total_groups: number;
      has_inventory_sources: boolean;
      total_inventory_sources: number;
      inventory_sources_with_failures: number;
      organization_id: number;
      kind: '' | 'smart' | 'constructed';
    };
    project: Pick<Project, 'id' | 'name'>;
    execution_environment?: { id: number; name: string };
    organization?: {
      id: number;
      name: string;
      description: string;
    };
    object_roles: {
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
      approval_role: {
        description: string;
        name: string;
        id: number;
      };
      admin_role: {
        description: string;
        name: string;
        id: number;
      };
    };
    recent_jobs:
      | { id: number; status: string; finished: null; canceled_on: null; type: string }[]
      | [];
    created_by: SummaryFieldsByUser;
    modified_by: SummaryFieldsByUser;
    user_capabilities: {
      edit: boolean;
      delete: boolean;
      start: boolean;
      schedule: boolean;
      copy: boolean;
    };
    credentials: SummaryFieldCredential[];
  };
}

export interface WorkflowJobTemplateForm
  extends Omit<
    WorkflowJobTemplate,
    | 'summary_fields'
    | 'status'
    | 'last_job_run'
    | 'next_job_run'
    | 'last_job_failed'
    | 'organization'
    | 'inventory'
    | 'webhook_credential'
    | 'skip_tags'
    | 'job_tags'
    | 'type'
    | 'execution_environment'
    | 'id'
    | 'job_type'
    | 'related'
    | 'created'
    | 'modified'
    | 'extra_vars'
    | 'ask_instance_groups_on_launch'
    | 'webhook_service'
    | 'labels'
  > {
  isWebhookEnabled: boolean;
  extra_vars: string;
  id?: number;
  webhook_receiver?: string;
  webhook_key?: string;
  skip_tags: { name: string; value: string; label: string }[];
  job_tags: { name: string; value: string; label: string }[];
  webhook_credential: SummaryFieldCredential | null;
  labels: { id: number; name: string }[] | [];
  inventory: {
    name: string;
    id: number;
  } | null;
  webhook_service?: string;
  organization?: number | string | null;
  summary_fields?: Partial<WorkflowJobTemplate['summary_fields']>;
}

export interface WorkflowJobTemplateCreate
  extends Omit<
    WorkflowJobTemplate,
    | 'id'
    | 'name'
    | 'extra_vars'
    | 'summary_fields'
    | 'related'
    | 'job_type'
    | 'type'
    | 'created'
    | 'modified'
    | 'ask_instance_groups_on_launch'
    | 'inventory'
    | 'status'
    | 'last_job_run'
    | 'next_job_run'
    | 'last_job_failed'
    | 'webhook_service'
    | 'labels'
    | 'organization'
  > {
  name: string;
  inventory?: number;
  isWebhookEnabled: boolean;
  allow_simultaneous: boolean;
  webhook_service?: string;
  labels?: { id: number; name: string }[] | null;
  skip_tags: string;
  job_tags: string;
  webhook_credential: number | null;
  extra_vars: string;
  organization?: number;
}
