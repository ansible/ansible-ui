import { ExecutionEnvironment } from '../../interfaces/ExecutionEnvironment';
import { Inventory } from '../../interfaces/Inventory';
import { InventorySource } from '../../interfaces/InventorySource';
import { JobTemplate } from '../../interfaces/JobTemplate';
import { LaunchConfiguration } from '../../interfaces/LaunchConfiguration';
import { Project } from '../../interfaces/Project';
import { SystemJobTemplate } from '../../interfaces/SystemJobTemplate';
import { WorkflowApproval } from '../../interfaces/WorkflowApproval';
import { WorkflowJobTemplate } from '../../interfaces/WorkflowJobTemplate';
import { Credential } from '../../interfaces/Credential';
import { EdgeStatus } from '../../resources/templates/WorkflowVisualizer/types';

export interface Resource {
  id: number;
  name: string;
  description: string;
  unified_job_type?: UnifiedJobType;
  timeout?: number;
  type?: string;
  inventory?: number;
  project?: number;
  ask_inventory_on_launch?: boolean;
  summary_fields?: { inventory: { kind: string } };
}
export type UnifiedJobType =
  | 'job'
  | 'workflow_job'
  | 'project_update'
  | 'workflow_approval'
  | 'inventory_update'
  | 'system_job';

export type AllResources =
  | InventorySource
  | JobTemplate
  | Project
  | SystemJobTemplate
  | WorkflowApproval
  | WorkflowJobTemplate;

export interface WorkflowVisualizerWizardFormValues extends WizardFormValues {
  approval_description: string;
  approval_name: string;
  approval_timeout: number;
  node_alias: string;
  node_convergence: 'any' | 'all';
  node_days_to_keep: number;
  node_status_type?: EdgeStatus;
}

export interface ScheduleWizardFormValues extends WizardFormValues {
  inventory?: number;
  resourceName: string;
  name: string;
  description?: string;
  startDateTime: { date: string; time: string };
  timezone: string;
}
export interface WizardFormValues {
  resource: AllResources | Resource | null;
  resource_type: UnifiedJobType;
  launch_config: LaunchConfiguration | null;
  prompt: PromptFormValues;
}

export interface PromptFormValues {
  inventory: Partial<Inventory> | null;
  credentials:
    | Credential[]
    | {
        id: number;
        name: string;
        credential_type: number;
        passwords_needed?: string[];
        vault_id?: string;
      }[];
  credential_passwords?: { [key: string]: string };
  instance_groups: { id: number; name: string }[];
  execution_environment: ExecutionEnvironment | { id: number; name: string } | null;
  diff_mode: boolean;
  extra_vars: string;
  forks: number;
  job_slice_count: number;
  job_tags: { name: string }[];
  job_type: string;
  labels: { name: string; id: number }[];
  limit: string;
  scm_branch: string;
  skip_tags: { name: string }[];
  timeout: number;
  verbosity: 0 | 1 | 2 | 3 | 4 | 5;
  organization?: number | null;
  original?: {
    credentials?:
      | {
          id: number;
          name: string;
          credential_type: number;
          passwords_needed?: string[];
          vault_id?: string;
        }[]
      | Credential[];
    instance_groups?: { id: number; name: string }[];
    labels?: { name: string; id: number }[];
    launch_config?: LaunchConfiguration;
  };
}
