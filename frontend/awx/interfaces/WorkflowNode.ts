import { ExecutionEnvironment } from './ExecutionEnvironment';
import { Inventory } from './Inventory';

export interface WorkflowNode {
  id: number;
  type: string;
  url: string;
  related: {
    labels: string;
    credentials: string;
    instance_groups: string;
    create_approval_template: string;
    success_nodes: string;
    failure_nodes: string;
    always_nodes: string;
    unified_job_template: string;
    workflow_job_template: string;
  };
  summary_fields: {
    job?: {
      description: string;
      elapsed: number;
      failed: boolean;
      id: number;
      name: string;
      status: string;
      type: string;
    };
    workflow_job: {
      id: number;
      name: string;
      description: string;
    };
    workflow_job_template: {
      id: number;
      name: string;
      description: string;
    };
    unified_job_template?: {
      id: number;
      name: string;
      description: string;
      unified_job_type:
        | 'job'
        | 'workflow_job'
        | 'project_update'
        | 'workflow_approval'
        | 'inventory_update'
        | 'system_job';
      timeout?: number;
    };
    inventory: Inventory;
    execution_environment: ExecutionEnvironment;
  };
  created: string;
  modified: string;
  extra_data: {
    days?: number;
    [key: string]: string | number | boolean | undefined;
  };
  inventory: null;
  scm_branch: null;
  job_type: null;
  job_tags: null;
  skip_tags: null;
  limit: null;
  diff_mode: null;
  verbosity: null;
  execution_environment: null;
  forks: null;
  job_slice_count: null;
  timeout: number | null;
  workflow_job_template: number;
  unified_job_template: number;
  success_nodes: number[];
  failure_nodes: number[];
  always_nodes: number[];
  all_parents_must_converge: boolean;
  identifier: string;
}

export interface WorkflowJobNode extends WorkflowNode {
  job?: string | number;
}

export interface WorkflowApprovalNode {
  name: string;
  type: 'Workflow Approval';
  all_parents_must_converge: string;
  description?: string;
  timeout?: string;
}
