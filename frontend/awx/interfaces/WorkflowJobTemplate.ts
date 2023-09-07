import { Label } from './Label';
import { WorkflowJobTemplate as SwaggerWorkflowJobTemplate } from './generated-from-swagger/api';
import { SummaryFieldCredential, SummaryFieldsByUser } from './summary-fields/summary-fields';

export interface WorkflowJobTemplate
  extends Omit<
    SwaggerWorkflowJobTemplate,
    'id' | 'name' | 'summary_fields' | 'job_type' | 'type' | 'related'
  > {
  id: number;
  job_type: 'workflow_job_template';
  name: string;
  inventory?: number;
  type: 'workflow_job_template';
  created: string;
  allow_simultaneous: boolean;
  modified: string;
  webhook_service?: 'github' | 'gitlab';
  ask_instance_groups_on_launch: boolean;
  skip_tags: string;
  job_tags: string;
  webhook_credential: number | null;
  extra_vars: '---';
  related: {
    schedules: string;
    instance_groups: string;
    webhook_receiver: string;
    webhook_key: string;
  };
  summary_fields: {
    webhook_credential: SummaryFieldCredential;
    labels: { count: number; results: Label[] };
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
    organization?: {
      id: number;
      name: string;
      description: string;
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
    approval_role: {
      description: string;
      name: string;
      id: number;
    };
    recent_jobs: [];
    created_by: SummaryFieldsByUser;
    modified_by: SummaryFieldsByUser;
    object_roles: {
      admin_role: { id: number };
      execute_role: { id: number };
      read_role: { id: number };
      approval_role: { id: number };
    };
  };
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
  > {
  name: string;
  inventory?: number;
  isWebhookEnabled: boolean;
  allow_simultaneous: boolean;
  webhook_service?: 'github' | 'gitlab';
  labels: Label[] | null;

  skip_tags: string;
  job_tags: string;
  webhook_credential: number | null;
  extra_vars: string;
  organization?: number;
}

export interface WorkflowJobTemplateForm
  extends Omit<
    WorkflowJobTemplate,
    | 'summary_fields'
    | 'organization'
    | 'inventory'
    | 'webhook_credential'
    | 'skip_tags'
    | 'job_tags'
    | 'type'
    | 'id'
    | 'job_type'
    | 'related'
    | 'created'
    | 'modified'
    | 'extra_vars'
    | 'webhook_service'
    | 'ask_instance_groups_on_launch'
  > {
  isWebhookEnabled: boolean;
  extra_vars: string;
  id?: number;
  webhook_receiver?: string;
  webhook_key?: string;
  webhook_service?: 'github' | 'gitlab';
  skip_tags: { name: string; value: string; label: string }[];
  job_tags: { name: string; value: string; label: string }[];
  webhook_credential: SummaryFieldCredential | null;
  labels: Label[] | null;
  inventory: {
    name: string;
    id: number;
  } | null;
  organization: { name: string; id: number } | null;
}
