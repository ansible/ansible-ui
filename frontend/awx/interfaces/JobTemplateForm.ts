import { InstanceGroup } from './InstanceGroup';
import { JobTemplate } from './JobTemplate';

export interface JobTemplateSummaryFields
  extends Omit<
    JobTemplate['summary_fields'],
    | 'created_by'
    | 'execution_environment'
    | 'inventory'
    | 'last_job'
    | 'last_update'
    | 'modified_by'
    | 'object_roles'
    | 'organization'
    | 'project'
    | 'recent_jobs'
    | 'resolved_environment'
    | 'user_capabilities'
  > {
  inventory?: { name?: string; id?: number } | null;
  project: { id?: number; name?: string; organization?: number } | null;
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
  project: number | undefined;
}
