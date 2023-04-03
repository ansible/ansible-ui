import { UnifiedJob } from '../../interfaces/UnifiedJob';
import { RouteObj } from '../../../Routes';

/** Returns the jobs API endpoint based on the job type */
export function getJobsAPIUrl(type: string) {
  switch (type) {
    case 'ad_hoc_command':
      return '/api/v2/ad_hoc_commands/';
    case 'inventory_update':
      return '/api/v2/inventory_updates/';
    case 'project_update':
      return '/api/v2/project_updates/';
    case 'system_job':
      return '/api/v2/system_jobs/';
    case 'workflow_job':
      return '/api/v2/workflow_jobs/';
    default:
      return '/api/v2/jobs/';
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
        ? `/api/v2/inventory_sources/${job.inventory_source}/update/`
        : undefined;
    case 'project_update':
      return job.project ? `/api/v2/projects/${job.project}/update/` : undefined;
  }
}

const jobPaths: { [key: string]: string } = {
  project_update: 'project',
  inventory_update: 'inventory',
  job: 'playbook',
  ad_hoc_command: 'command',
  system_job: 'management',
  workflow_job: 'workflow',
};
export function getJobOutputUrl(job: UnifiedJob) {
  return RouteObj.JobOutput.replace(':job_type', jobPaths[job.type]).replace(
    ':id',
    job.id.toString()
  );
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
