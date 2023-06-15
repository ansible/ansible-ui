import { InstanceGroup } from './InstanceGroup';
import { JobTemplate } from './JobTemplate';

export interface JobTemplateSummaryFields
  extends Omit<
    JobTemplate['summary_fields'],
    | 'created_by'
    | 'modified_by'
    | 'organization'
    | 'inventory'
    | 'project'
    | 'execution_environment'
    | 'last_job'
    | 'last_update'
    | 'object_roles'
    | 'user_capabilities'
    | 'resolved_environment'
    | 'user_capabilities'
    | 'recent_jobs'
    | 'organization'
  > {
  inventory?: { name?: string; id?: number } | null;
  project?: { id?: number; name?: string; organization?: number };
  execution_environment?: { id?: number; name?: string };
}

export interface JobTemplateRelatedFields
  extends Pick<JobTemplate['related'], 'webhook_receiver' | 'callback' | 'webhook_key'> {
  webhook_receiver: string;
}
export interface JobTemplateForm
  extends Omit<
    JobTemplate,
    | 'last_job'
    | 'created_by'
    | 'type'
    | 'url'
    | 'created'
    | 'modified'
    | 'status'
    | 'id'
    | 'summary_fields'
    | 'related'
    | 'project'
    | 'organization'
  > {
  id?: number;
  enableHostConfig?: boolean;
  organization?: number;
  instanceGroups: InstanceGroup[] | [];
  summary_fields: JobTemplateSummaryFields;
  related: JobTemplateRelatedFields;
  isWebhookEnabled: boolean;
  isProvisioningCallbackEnabled: boolean;
  arrayedSkipTags: { value: string; label: string }[];
  arrayedJobTags: { value: string; label: string }[];
  project: number | null;
}
