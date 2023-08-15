export interface LaunchConfiguration {
  [key: string]: string | boolean | number | string[] | object;
  can_start_without_user_input: boolean;
  passwords_needed_to_start: string[];
  ask_scm_branch_on_launch: boolean;
  ask_variables_on_launch: boolean;
  ask_tags_on_launch: boolean;
  ask_diff_mode_on_launch: boolean;
  ask_skip_tags_on_launch: boolean;
  ask_job_type_on_launch: boolean;
  ask_limit_on_launch: boolean;
  ask_verbosity_on_launch: boolean;
  ask_inventory_on_launch: boolean;
  ask_credential_on_launch: boolean;
  ask_execution_environment_on_launch: boolean;
  ask_labels_on_launch: boolean;
  ask_forks_on_launch: boolean;
  ask_job_slice_count_on_launch: boolean;
  ask_timeout_on_launch: boolean;
  ask_instance_groups_on_launch: boolean;
  survey_enabled: boolean;
  variables_needed_to_start: string[];
  credential_needed_to_start: boolean;
  inventory_needed_to_start: boolean;
  defaults: {
    inventory: {
      name: string;
      id: number;
    };
    limit: string;
    labels: { id: number; name: string }[];
    scm_branch: string;
    job_tags: string;
    skip_tags: string;
    extra_vars: string;
    diff_mode: false;
    job_type: 'run' | 'check';
    verbosity: '0' | '1' | '2' | '3' | '4' | '5';
    credentials?: [
      {
        id: number;
        name: string;
        credential_type: number;
        passwords_needed: string[];
      },
    ];
    execution_environment: { id: number; name: string } | undefined | null;
    forks: number;
    job_slice_count: number;
    timeout: number;
    instance_groups: [];
  };
  job_template_data: {
    name: string;
    id: number;
    description: string;
  };
}
