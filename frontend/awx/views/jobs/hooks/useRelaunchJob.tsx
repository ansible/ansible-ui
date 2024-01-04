import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { usePageAlertToaster } from '../../../../../framework';
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
import { useGetJobOutputUrl } from '../useGetJobOutputUrl';

export function useRelaunchJob(jobRelaunchParams?: JobRelaunch) {
  const alertToaster = usePageAlertToaster();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const postRequest = usePostRequest();
  const getJobOutputUrl = useGetJobOutputUrl();

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
        let relaunchJob;
        switch (job.type) {
          case 'ad_hoc_command': {
            relaunchJob = await postRequest(relaunchEndpoint, {} as AdHocCommandRelaunch);
            break;
          }
          case 'workflow_job': {
            relaunchJob = await postRequest(relaunchEndpoint, {} as WorkflowJobRelaunch);
            break;
          }
          case 'job': {
            relaunchJob = await postRequest(relaunchEndpoint, {
              ...jobRelaunchParams,
            } as JobRelaunch);
            break;
          }
          case 'inventory_update':
            relaunchJob = await postRequest(relaunchEndpoint, {} as InventorySourceUpdate);
            break;
          case 'project_update':
            relaunchJob = await postRequest(relaunchEndpoint, {} as ProjectUpdateView);
            break;
        }
        navigate(getJobOutputUrl(relaunchJob as UnifiedJob));
      }
    } catch (error) {
      alertToaster.addAlert({
        variant: 'danger',
        title: t('Failed to relaunch job'),
        children: error instanceof Error && error.message,
        timeout: 2000,
      });
    }
  };
}
