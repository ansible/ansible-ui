import { UnifiedJob } from '../../interfaces/UnifiedJob'

/** Returns the jobs API endpoint based on the job type */
export function getJobsAPIUrl(type: string) {
  switch (type) {
    case 'ad_hoc_command':
      return '/api/v2/ad_hoc_commands/'
    case 'inventory_update':
      return '/api/v2/inventory_updates/'
    case 'project_update':
      return '/api/v2/project_updates/'
    case 'system_job':
      return '/api/v2/system_jobs/'
    case 'workflow_job':
      return '/api/v2/workflow_jobs/'
    default:
      return '/api/v2/jobs/'
  }
}

export function isJobRunning(status: string) {
  return ['new', 'pending', 'waiting', 'running'].includes(status)
}

export function getRelaunchEndpoint(job: UnifiedJob) {
  switch (job.type) {
    case 'ad_hoc_command':
    case 'workflow_job':
    case 'job':
      return `${getJobsAPIUrl(job.type)}${job.id}/relaunch/`
    case 'inventory_update':
    case 'project_update':
      return `${getJobsAPIUrl(job.type)}${job.id}/update/`
    case 'system_job':
      return `${getJobsAPIUrl(job.type)}${job.id}/update/`
    default:
      return `/api/v2/jobs/${job.id}/relaunch/`
  }
}
