export interface WorkflowNode {
  id: number;
  type: string;
  url: string;
  related: {
    named_url: string;
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
      unified_job_type: string;
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
  timeout: null;
  workflow_job_template: number;
  unified_job_template: number;
  success_nodes: number[];
  failure_nodes: number[];
  always_nodes: number[];
  all_parents_must_converge: boolean;
  identifier: string;
}
