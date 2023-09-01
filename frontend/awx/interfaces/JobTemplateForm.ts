import { Credential } from './Credential';
import { InstanceGroup } from './InstanceGroup';
import { JobTemplate } from './JobTemplate';
import { Project } from './Project';
import { Label } from './Label';
import { SummaryFieldCredential } from './summary-fields/summary-fields';
export interface JobTemplateRelatedFields
  extends Pick<JobTemplate['related'], 'webhook_receiver' | 'callback' | 'webhook_key'> {
  webhook_receiver: string;
}
export interface JobTemplateForm
  extends Omit<
    JobTemplate,
    | 'created'
    | 'created_by'
    | 'execution_environment'
    | 'id'
    | 'inventory'
    | 'job_tags'
    | 'last_job'
    | 'modified'
    | 'organization'
    | 'related'
    | 'skip_tags'
    | 'status'
    | 'summary_fields'
    | 'type'
    | 'url'
    | 'webhook_credential'
    | 'last_job_run'
    | 'last_job_failed'
    | 'next_job_run'
    | 'project'
    | 'survey_enabled'
  > {
  credentials: Pick<Credential, 'id' | 'name' | 'cloud' | 'description' | 'kind'>[];
  enableHostConfig?: boolean;
  execution_environment: { id: number; name: string } | null;
  id?: number;
  instance_groups: InstanceGroup[];
  inventory: { name?: string; id?: number } | null;
  isProvisioningCallbackEnabled: boolean;
  isWebhookEnabled: boolean;
  job_tags: { name: string; value: string; label: string }[];
  labels: Label[];
  organization?: number;
  playbook: string;
  project: Pick<Project, 'id' | 'name'>;
  related: JobTemplateRelatedFields;
  skip_tags: { name: string; value: string; label: string }[];
  webhook_credential: SummaryFieldCredential;
}

export interface JobTemplateCreate {
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
  description?: string;
  diff_mode: boolean;
  extra_vars: string;
  forks: number;
  host_config_key: string;
  inventory: number | null;
  job_slice_count: number;
  job_tags: string;
  job_type: string;
  limit: string;
  name: string;
  playbook: string;
  prevent_instance_group_fallback: boolean;
  project: number;
  scm_branch: string;
  skip_tags: string;
  survey_enabled?: boolean;
  timeout: number;
  use_fact_cache: boolean;
  verbosity: number;
  webhook_credential: number | null;
  webhook_service: string;
}
