import { ItemsResponse, requestGet, requestPost } from '../../../../Data'
import {
  AdHocCommandRelaunch,
  InventorySourceUpdate,
  JobRelaunch,
  ProjectUpdateView,
  WorkflowJobRelaunch,
} from '../../../interfaces/RelaunchConfiguration'
import { UnifiedJob } from '../../../interfaces/UnifiedJob'
import { getRelaunchEndpoint } from '../jobUtils'

export function useRelaunchJob(jobRelaunchParams?: JobRelaunch) {
  return async (job: UnifiedJob) => {
    const relaunchEndpoint = getRelaunchEndpoint(job)

    if (!relaunchEndpoint) {
      return Promise.reject(new Error('Unable to retrieve launch configuration'))
    }

    // Get relaunch configuration
    try {
      let relaunchConfig
      switch (job.type) {
        case 'ad_hoc_command': {
          relaunchConfig = await requestGet<ItemsResponse<AdHocCommandRelaunch>>(relaunchEndpoint)
          break
        }
        case 'workflow_job': {
          relaunchConfig = await requestGet<ItemsResponse<WorkflowJobRelaunch>>(relaunchEndpoint)
          break
        }
        case 'job': {
          relaunchConfig = await requestGet<JobRelaunch>(relaunchEndpoint)
          break
        }
        case 'inventory_update':
          relaunchConfig = await requestGet<InventorySourceUpdate>(relaunchEndpoint)
          break
        case 'project_update':
          relaunchConfig = await requestGet<ProjectUpdateView>(relaunchEndpoint)
          break
      }

      // Relaunch job
      if (
        (relaunchConfig as JobRelaunch).passwords_needed_to_start &&
        (relaunchConfig as JobRelaunch).passwords_needed_to_start?.length
      ) {
        // TODO: If password is needed for relaunch, handle with dialog
      } else {
        switch (job.type) {
          case 'ad_hoc_command': {
            await requestPost<AdHocCommandRelaunch>(relaunchEndpoint, {} as AdHocCommandRelaunch)
            break
          }
          case 'workflow_job': {
            await requestPost<WorkflowJobRelaunch>(relaunchEndpoint, {} as WorkflowJobRelaunch)
            break
          }
          case 'job': {
            await requestPost<JobRelaunch>(relaunchEndpoint, {
              ...jobRelaunchParams,
            } as JobRelaunch)
            break
          }
          case 'inventory_update':
            await requestPost<InventorySourceUpdate>(relaunchEndpoint, {} as InventorySourceUpdate)
            break
          case 'project_update':
            await requestPost<ProjectUpdateView>(relaunchEndpoint, {} as ProjectUpdateView)
            break
        }
        return Promise.resolve()
      }
    } catch (error) {
      // TODO: Handle displaying error
      return Promise.reject(error)
    }
    // TODO: The relaunch should open up the job details UI
  }
}
