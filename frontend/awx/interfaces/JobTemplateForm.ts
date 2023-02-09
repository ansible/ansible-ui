import { ExecutionEnvironment } from './ExecutionEnvironment';
import { InstanceGroup } from './InstanceGroup';
import { Inventory } from './Inventory';
import { Label } from './Label';
import { Project } from './Project';
import { Credential } from './Credential';

export interface JobTemplateForm {
  id?: number;
  allow_callbacks?: boolean;
  organization?: number;
  allow_simultaneous: boolean;
  ask_credential_on_launch: boolean;
  ask_diff_mode_on_launch: boolean;
  ask_execution_environment_on_launch: boolean;
  ask_forks_on_launch: boolean;
  ask_instance_groups_on_launch: boolean;
  ask_inventory_on_launch: boolean;
  ask_job_slice_count_on_launch: boolean;
  ask_job_type_on_launch: boolean;
  ask_labels_on_launch: boolean;
  ask_limit_on_launch: boolean;
  ask_scm_branch_on_launch: boolean;
  ask_skip_tags_on_launch: boolean;
  ask_tags_on_launch: boolean;
  ask_timeout_on_launch: boolean;
  ask_variables_on_launch: boolean;
  ask_verbosity_on_launch: boolean;
  become_enabled: boolean;
  related: { webhook_receiver?: string; callback?: string; webhook_key?: string };
  description: string;
  diff_mode: boolean;
  extra_vars: string;
  forks: number;
  host_config_key: string;
  instanceGroups: InstanceGroup[];
  summary_fields: {
    inventory?: Partial<Inventory>;
    credentials?: Credential[];
    labels?: { results?: Label[] };
    project?: Partial<Project>;
    execution_environment?: Partial<ExecutionEnvironment>;
    webhook_credential?: Credential;
  };
  job_slice_count: number;
  job_tags: string;
  job_type: 'run' | 'check';
  limit: string;
  name: string;
  playbook: string;
  prevent_instance_group_fallback: boolean;
  project?: number;
  scm_branch: string;
  skip_tags: string;
  timeout: number;
  use_fact_cache: boolean;
  verbosity: 0 | 1 | 3 | 2 | 4 | 5;
  webhook_service: string;
  webhook_url: string;
  webhook_key: string;
}
