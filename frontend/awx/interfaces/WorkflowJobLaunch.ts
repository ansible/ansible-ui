export interface WorkflowJobLaunch {
  ask_inventory_on_launch: boolean;
  ask_labels_on_launch: boolean;
  ask_limit_on_launch: boolean;
  ask_scm_branch_on_launch: boolean;
  ask_skip_tags_on_launch: boolean;
  ask_tags_on_launch: boolean;
  ask_variables_on_launch: boolean;
  can_start_without_user_input: boolean;
  node_prompts_rejected: number[];
  node_templates_missing: number[];
  survey_enabled: boolean;
  variables_needed_to_start: string[];
  workflow_job_template_data: {
    id: number;
    name: string;
    description: string;
  };
  defaults: {
    extra_vars: string;
    inventory: {
      id: number;
      name: string;
    };
    job_tags: string;
    labels: {
      id: number;
      name: string;
    }[];
    limit: string;
    scm_branch: string;
    skip_tags: string;
  };
}
