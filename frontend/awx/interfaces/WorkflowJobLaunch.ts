import { InstanceGroup } from './InstanceGroup';

export interface WorkflowJobLaunch {
  survey_enabled: boolean;
  ask_credential_on_launch: boolean;
  ask_diff_mode_on_launch: boolean;
  ask_inventory_on_launch: boolean;
  ask_job_type_on_launch: boolean;
  ask_limit_on_launch: boolean;
  ask_scm_branch_on_launch: boolean;
  ask_skip_tags_on_launch: boolean;
  ask_tags_on_launch: boolean;
  ask_variables_on_launch: boolean;
  ask_verbosity_on_launch: boolean;
  ask_execution_environment_on_launch: boolean;
  ask_labels_on_launch: boolean;
  ask_forks_on_launch: boolean;
  ask_job_slice_count_on_launch: boolean;
  ask_timeout_on_launch: boolean;
  ask_instance_groups_on_launch: boolean;
  can_start_without_user_input: boolean;
  node_prompts_rejected: number[];
  node_templates_missing: number[];
  variables_needed_to_start: string[];
  workflow_job_template_data: {
    id: number;
    name: string;
    description: string;
  };
  defaults: {
    diff_mode: boolean;
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
    job_type: string;
    verbosity: number;
    credentials: {
      name: string;
      credential_type: string | number;
      id: number;
      passwords_needed: [];
    }[];
    forks: number;
    job_slice_count: number;
    time_out: number;
    instance_groups: InstanceGroup[];
    execution_environment: { id: number; name: string } | null;
  };
}
