import {
  UnifiedJobList as SwaggerUnifiedJobList,
  InventoryUpdateList as SwaggerInventoryUpdateList,
  JobList as SwaggerJobList,
  ProjectUpdateList as SwaggerProjectUpdateList,
  WorkflowJob as SwaggerWorkflowJob,
  SystemJob as SwaggerSystemJob,
} from './generated-from-swagger/api';
import { SummaryFieldsUnifiedJob } from './summary-fields/summary-fields';

type JobListProperties = Pick<
  SwaggerJobList,
  | 'job_type'
  | 'inventory'
  | 'project'
  | 'playbook'
  | 'scm_branch'
  | 'forks'
  | 'limit'
  | 'verbosity'
  | 'extra_vars'
  | 'job_tags'
  | 'force_handlers'
  | 'skip_tags'
  | 'start_at_task'
  | 'timeout'
  | 'use_fact_cache'
  | 'job_template'
  | 'passwords_needed_to_start'
  | 'allow_simultaneous'
  | 'artifacts'
  | 'scm_revision'
  | 'instance_group'
  | 'diff_mode'
  | 'job_slice_number'
  | 'job_slice_count'
  | 'webhook_service'
  | 'webhook_credential'
  | 'webhook_guid'
>;
type InventoryUpdateProperties = Pick<SwaggerInventoryUpdateList, 'source' | 'inventory_source'>;
type ProjectUpdateProperties = Pick<
  SwaggerProjectUpdateList,
  | 'local_path'
  | 'scm_type'
  | 'scm_url'
  | 'scm_refspec'
  | 'scm_clean'
  | 'scm_track_submodules'
  | 'scm_delete_on_update'
>;
type WorkflowJobProperties = Pick<SwaggerWorkflowJob, 'workflow_job_template' | 'is_sliced_job'>;
type SystemJobProperties = Pick<SwaggerSystemJob, 'system_job_template' | 'result_stdout'>;

export interface UnifiedJob
  extends Omit<
      SwaggerUnifiedJobList,
      'id' | 'type' | 'name' | 'summary_fields' | 'launched_by' | 'related'
    >,
    JobListProperties,
    InventoryUpdateProperties,
    ProjectUpdateProperties,
    WorkflowJobProperties,
    SystemJobProperties {
  name: string;
  id: number;
  type: string;
  related: {
    created_by?: string;
    labels?: string;
    inventory?: string;
    project?: string;
    organization?: string;
    credentials?: string;
    unified_job_template?: string;
    stdout?: string;
    execution_environment?: string;
    job_events?: string;
    job_host_summaries?: string;
    activity_stream?: string;
    notifications: string;
    create_schedule?: string;
    job_template?: string;
    cancel: string;
    project_update?: string;
    relaunch?: string;
    scm_inventory_updates?: string;
    events?: string;
    modified_by?: string;
    workflow_job_template?: string;
    workflow_nodes?: string;
    source_workflow_job?: string;
    schedule?: string;
    system_job_template?: string;
  };
  summary_fields: SummaryFieldsUnifiedJob;
  launched_by: {
    id: number;
    name: string;
    type: string;
    url: string;
  };
}
