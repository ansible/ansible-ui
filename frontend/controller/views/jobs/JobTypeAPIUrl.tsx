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
