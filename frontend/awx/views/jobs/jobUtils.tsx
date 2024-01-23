import { awxAPI } from '../../common/api/awx-utils';
import { UnifiedJob } from '../../interfaces/UnifiedJob';

/** Returns the jobs API endpoint based on the job type */
export function getJobsAPIUrl(type: string) {
  switch (type) {
    case 'ad_hoc_command':
      return awxAPI`/ad_hoc_commands/`;
    case 'inventory_update':
      return awxAPI`/inventory_updates/`;
    case 'project_update':
      return awxAPI`/project_updates/`;
    case 'system_job':
      return awxAPI`/system_jobs/`;
    case 'workflow_job':
      return awxAPI`/workflow_jobs/`;
    default:
      return awxAPI`/jobs/`;
  }
}

type JobStatus =
  | 'failed'
  | 'new'
  | 'pending'
  | 'waiting'
  | 'running'
  | 'successful'
  | 'error'
  | 'canceled'
  | undefined;

export function isJobRunning(status: JobStatus) {
  return ['new', 'pending', 'waiting', 'running'].includes(status ?? 'waiting');
}

/** Returns the jobs relaunch endpoint based on the job type */
export function getRelaunchEndpoint(job: UnifiedJob) {
  const baseUrl = getJobsAPIUrl(job.type);
  switch (job.type) {
    case 'ad_hoc_command':
    case 'workflow_job':
    case 'job':
      return `${baseUrl}${job.id}/relaunch/`;
    case 'inventory_update':
      return job.inventory_source
        ? awxAPI`/inventory_sources/${job.inventory_source}/update/`
        : undefined;
    case 'project_update':
      return job.project ? awxAPI`/projects/${job.project}/update/` : undefined;
  }
}

/**
 * Returns the schedule URL for a scheduled job
 */
export function getScheduleUrl(job: UnifiedJob) {
  const templateId = job.summary_fields?.unified_job_template?.id;
  const scheduleId = job.summary_fields?.schedule?.id;
  const inventoryId = job.summary_fields?.inventory ? job.summary_fields.inventory.id : null;
  let scheduleUrl;

  if (templateId && scheduleId) {
    switch (job.type) {
      case 'inventory_update':
        scheduleUrl = inventoryId
          ? `/inventories/inventory/${inventoryId}/sources/${templateId}/schedules/${scheduleId}/details`
          : '';
        break;
      case 'job':
        scheduleUrl = `/templates/job_template/${templateId}/schedules/${scheduleId}/details`;
        break;
      case 'project_update':
        scheduleUrl = `/projects/${templateId}/schedules/${scheduleId}/details`;
        break;
      case 'system_job':
        scheduleUrl = `/management_jobs/${templateId}/schedules/${scheduleId}/details`;
        break;
      case 'workflow_job':
        scheduleUrl = `/templates/workflow_job_template/${templateId}/schedules/${scheduleId}/details`;
        break;
      default:
        break;
    }
  }

  return scheduleUrl;
}

export type LaunchedBy = {
  link?: string;
  value?: string;
};

/**
 * Returns "Launched by" details (value and link) for a job
 */
export function getLaunchedByDetails(job: UnifiedJob) {
  const createdBy = job.summary_fields?.created_by;
  const jobTemplate = job.summary_fields?.job_template;
  const workflowJT = job.summary_fields?.workflow_job_template;
  const schedule = job.summary_fields?.schedule;

  if (!createdBy && !schedule) {
    return {};
  }

  let link: string | undefined;
  let value: string | undefined;

  switch (job.launch_type) {
    case 'webhook':
      value = 'Webhook';
      link = jobTemplate
        ? `/templates/job_template/${jobTemplate.id}/details`
        : workflowJT
          ? `/templates/workflow_job_template/${workflowJT.id}/details`
          : undefined;
      break;
    case 'scheduled':
      value = schedule?.name;
      link = getScheduleUrl(job);
      break;
    case 'manual':
      link = createdBy?.id ? `/users/${createdBy.id.toString()}/details` : undefined;
      value = createdBy ? createdBy.username : undefined;
      break;
    default:
      link = createdBy?.id ? `/users/${createdBy.id}/details` : undefined;
      value = createdBy ? createdBy.username : undefined;
      break;
  }

  return { link, value };
}
