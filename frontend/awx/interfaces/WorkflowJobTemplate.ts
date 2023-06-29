import { WorkflowJobTemplate as SwaggerWorkflowJobTemplate } from './generated-from-swagger/api';
import { SummaryFieldsByUser } from './summary-fields/summary-fields';

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
  webhook_service: 'github' | 'gitlab' | null;
  webhook_credential: number;
  related: { schedules: string };
  summary_fields: {
    webhook_credential: {
      id: number;
      name: string;
      description: string;
      kind: string;
      cloud: boolean;
      credential_type_id: number;
    };
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
      id: string;
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
