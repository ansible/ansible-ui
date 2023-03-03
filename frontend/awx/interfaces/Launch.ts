export interface Launch {
  ask_inventory_on_launch: boolean;
  ask_limit_on_launch: boolean;
  ask_scm_branch_on_launch: boolean;
  can_start_without_user_input: boolean;
  defaults: {
    inventory: {
      name: string;
      id: number;
    };
    limit: number;
    scm_branch: string;
    job_tags: string;
    skip_tags: string;
    extra_vars: string;
  };
  survey_enabled: boolean;
  variables_needed_to_start: string[];
  node_templates_missing: number[];
  node_prompts_rejected: number[];
  workflow_job_template_data: {
    name: string;
    id: number;
    description: string;
  };
  credential_passwords: { [key: string]: string | number | boolean | undefined };
  ask_variables_on_launch: boolean;
  ask_labels_on_launch: boolean;
  ask_skip_tags_on_launch: boolean;
  ask_tags_on_launch: boolean;
  ask_execution_environment_on_launch: boolean;
  ask_forks_on_launch: boolean;
  ask_job_slice_count_on_launch: boolean;
  ask_timeout_on_launch: boolean;
  ask_instance_groups_on_launch: boolean;
  passwords_needed_to_start: string[];
  [index: string]:
    | string
    | number
    | boolean
    | string[]
    | object
    | { [key: string]: string | number | boolean }
    | undefined;
}
