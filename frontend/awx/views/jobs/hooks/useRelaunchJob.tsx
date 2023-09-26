import { useTranslation } from 'react-i18next';
import { useGetPageUrl, usePageAlertToaster } from '../../../../../framework';
import { requestGet } from '../../../../common/crud/Data';
import { usePostRequest } from '../../../../common/crud/usePostRequest';
import { AwxItemsResponse } from '../../../common/AwxItemsResponse';
import {
  AdHocCommandRelaunch,
  InventorySourceUpdate,
  JobRelaunch,
  ProjectUpdateView,
  WorkflowJobRelaunch,
} from '../../../interfaces/RelaunchConfiguration';
import { UnifiedJob } from '../../../interfaces/UnifiedJob';
import { getRelaunchEndpoint } from '../jobUtils';
import { AwxRoute } from '../../../AwxRoutes';

export function useRelaunchJob(jobRelaunchParams?: JobRelaunch) {
  const alertToaster = usePageAlertToaster();
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const postRequest = usePostRequest();

  return async (job: UnifiedJob) => {
    const relaunchEndpoint = getRelaunchEndpoint(job);

    if (!relaunchEndpoint) {
      return Promise.reject(new Error('Unable to retrieve launch configuration'));
    }

    // Get relaunch configuration
    try {
      let relaunchConfig;
      switch (job.type) {
        case 'ad_hoc_command': {
          relaunchConfig =
            await requestGet<AwxItemsResponse<AdHocCommandRelaunch>>(relaunchEndpoint);
          break;
        }
        case 'workflow_job': {
          relaunchConfig =
            await requestGet<AwxItemsResponse<WorkflowJobRelaunch>>(relaunchEndpoint);
          break;
        }
        case 'job': {
          relaunchConfig = await requestGet<JobRelaunch>(relaunchEndpoint);
          break;
        }
        case 'inventory_update':
          relaunchConfig = await requestGet<InventorySourceUpdate>(relaunchEndpoint);
          break;
        case 'project_update':
          relaunchConfig = await requestGet<ProjectUpdateView>(relaunchEndpoint);
          break;
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
            await postRequest(relaunchEndpoint, {} as AdHocCommandRelaunch);
            break;
          }
          case 'workflow_job': {
            await postRequest(relaunchEndpoint, {} as WorkflowJobRelaunch);
            break;
          }
          case 'job': {
            await postRequest(relaunchEndpoint, {
              ...jobRelaunchParams,
            } as JobRelaunch);
            break;
          }
          case 'inventory_update':
            await postRequest(relaunchEndpoint, {} as InventorySourceUpdate);
            break;
          case 'project_update':
            await postRequest(relaunchEndpoint, {} as ProjectUpdateView);
            break;
        }
        getPageUrl(AwxRoute.JobPage, {
          params: { id: job.id, job_type: job.type },
        });
      }
    } catch (error) {
      alertToaster.addAlert({
        variant: 'danger',
        title: t('Failed to relaunch job'),
        children: error instanceof Error && error.message,
      });
    }
  };
}
