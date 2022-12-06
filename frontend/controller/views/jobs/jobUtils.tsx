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

/** Returns the jobs relaunch endpoint based on the job type */
export function getRelaunchEndpoint(job: UnifiedJob) {
  const baseUrl = getJobsAPIUrl(job.type)
  switch (job.type) {
    case 'ad_hoc_command':
    case 'workflow_job':
    case 'job':
      return `${baseUrl}${job.id}/relaunch/`
    case 'inventory_update':
      return job.inventory_source
        ? `/api/v2/inventory_sources/${job.inventory_source}/update/`
        : undefined
    case 'project_update':
      return job.project ? `/api/v2/projects/${job.project}/update/` : undefined
  }
}
