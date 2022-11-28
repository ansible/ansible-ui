// import { requestGet } from '../../../../Data'
// import { UnifiedJob } from '../../../interfaces/UnifiedJob'
// import { getRelaunchEndpoint } from '../jobUtils'

// export function useLaunchJob() {
//   return async (job: UnifiedJob) => {
//     const readRelaunchEndpoint = getRelaunchEndpoint(job)

//     try {
//       // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
//       const { data: relaunchConfig } = await requestGet(readRelaunchEndpoint)
//       if (readRelaunchEndpoint) {
//         if (
//           !relaunchConfig.passwords_needed_to_start ||
//           relaunchConfig.passwords_needed_to_start.length === 0
//         ) {
//           if (resource.type === 'inventory_update') {
//             relaunch = InventorySourcesAPI.launchUpdate(resource.inventory_source)
//           } else if (resource.type === 'project_update') {
//             relaunch = ProjectsAPI.launchUpdate(resource.project)
//           } else if (resource.type === 'workflow_job') {
//             relaunch = WorkflowJobsAPI.relaunch(resource.id)
//           } else if (resource.type === 'ad_hoc_command') {
//             relaunch = AdHocCommandsAPI.relaunch(resource.id)
//           } else if (resource.type === 'job') {
//             relaunch = JobsAPI.relaunch(resource.id, params || {})
//           }
//           const { data: job } = await relaunch
//           history.push(`/jobs/${job.id}/output`)
//         }
//         // TODO: If password is needed for relaunch, handle with dialog
//       }
//     } catch (error) {}
//   }
// }
