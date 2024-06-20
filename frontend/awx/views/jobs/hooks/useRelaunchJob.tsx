import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { usePageAlertToaster, usePageNavigate } from '../../../../../framework';
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
import { relaunchEndpoint } from '../jobUtils';
import { useGetJobOutputUrl } from '../useGetJobOutputUrl';
import { AwxRoute } from '../../../main/AwxRoutes';

export function useRelaunchJob(jobRelaunchParams?: JobRelaunch) {
  const alertToaster = usePageAlertToaster();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const postRequest = usePostRequest();
  const getJobOutputUrl = useGetJobOutputUrl();
  const pageNavigate = usePageNavigate();

  return async (job: UnifiedJob) => {
    if (!relaunchEndpoint) {
      return Promise.reject(new Error('Unable to retrieve launch configuration'));
    }
    try {
      let relaunchConfig;
      switch (job.type) {
        case 'ad_hoc_command': {
          relaunchConfig = await requestGet<AwxItemsResponse<AdHocCommandRelaunch>>(
            relaunchEndpoint(job)
          );
          break;
        }
        case 'workflow_job': {
          relaunchConfig = await requestGet<AwxItemsResponse<WorkflowJobRelaunch>>(
            relaunchEndpoint(job)
          );
          break;
        }
        case 'job': {
          relaunchConfig = await requestGet<JobRelaunch>(relaunchEndpoint(job));
          break;
        }
        case 'inventory_update':
          relaunchConfig = await requestGet<InventorySourceUpdate>(relaunchEndpoint(job));
          break;
        case 'project_update':
          relaunchConfig = await requestGet<ProjectUpdateView>(relaunchEndpoint(job));
          break;
      }

      // Relaunch job

      if (
        (relaunchConfig as JobRelaunch).passwords_needed_to_start &&
        (relaunchConfig as JobRelaunch).passwords_needed_to_start?.length
      ) {
        pageNavigate(AwxRoute.TemplateLaunchWithPasswordsWizard, {
          params: { id: job.id, job_type: 'playbook' },
        });
        return;
      } else {
        let relaunchJob;
        switch (job.type) {
          case 'ad_hoc_command': {
            relaunchJob = await postRequest(relaunchEndpoint(job), {} as AdHocCommandRelaunch);
            break;
          }
          case 'workflow_job': {
            relaunchJob = await postRequest(relaunchEndpoint(job), {} as WorkflowJobRelaunch);
            break;
          }
          case 'job': {
            relaunchJob = await postRequest(relaunchEndpoint(job), {
              ...jobRelaunchParams,
            } as JobRelaunch);
            break;
          }
          case 'inventory_update':
            relaunchJob = await postRequest(relaunchEndpoint(job), {} as InventorySourceUpdate);
            break;
          case 'project_update':
            relaunchJob = await postRequest(relaunchEndpoint(job), {} as ProjectUpdateView);
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
