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
    workflow_job_template: {
      id: number;
      name: string;
      description: string;
    };
    unified_job_template: {
      id: number;
      name: string;
      description: string;
      unified_job_type: UnifiedJobType;
      timeout?: number;
    };
  };
  created: string;
  modified: string;
  extra_data: object;
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
  timeout: string | null;
  workflow_job_template: number;
  unified_job_template: number;
  success_nodes: number[];
  failure_nodes: number[];
  always_nodes: number[];
  all_parents_must_converge: boolean;
  identifier: string;
}

export interface WorkflowApprovalNode {
  name: string;
  type: 'Workflow Approval';
  convergence: string;
  description?: string;
  timeout?: string;
}

export enum UnifiedJobType {
  job = 'job',
  workflow_job = 'workflow_job',
  project_update = 'project_update',
  workflow_approval = 'workflow_approval',
  inventory_update = 'inventory_update',
  system_job = 'system_job',
}
