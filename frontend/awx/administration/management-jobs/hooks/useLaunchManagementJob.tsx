import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { usePageAlertToaster, usePageNavigate } from '../../../../../framework';
import { requestGet } from '../../../../common/crud/Data';
import { usePostRequest } from '../../../../common/crud/usePostRequest';
import { awxAPI } from '../../../common/api/awx-utils';
import { SystemJobTemplate } from '../../../interfaces/SystemJobTemplate';
import { AwxRoute } from '../../../main/AwxRoutes';
import { useGetJobOutputUrl } from '../../../views/jobs/useGetJobOutputUrl';
import type { UnifiedJob } from '../../../interfaces/UnifiedJob';

export function useLaunchManagementJob() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const postRequest = usePostRequest();
  const alertToaster = usePageAlertToaster();
  //const pageNavigate = usePageNavigate();
  const getJobOutputUrl = useGetJobOutputUrl();

  return async (managementJob: SystemJobTemplate) => {
    const launchManagementJobEndpoint = getLaunchMgtJobEndpoint(managementJob);

    if (!launchManagementJobEndpoint) {
      return Promise.reject(new Error('Unable to retrieve management job launch configuration'));
    }

    try {
      let managementJobLaunch;
      if (
        managementJob.job_type === 'cleanup_tokens' ||
        managementJob.job_type === 'cleanup_sessions'
      ) {
        managementJobLaunch = await postRequest(launchManagementJobEndpoint, {});
        navigate(getJobOutputUrl(managementJobLaunch as SystemJobTemplate));
      } else {
        console.log('Launching management job:', managementJob.job_type);
        navigate(getJobOutputUrl(managementJobLaunch as SystemJobTemplate));
      }
    } catch (error) {
      alertToaster.addAlert({
        variant: 'danger',
        title: t('Failed to launch management job'),
        children: error instanceof Error && error.message,
        timeout: 5000,
      });
    }
  };
}

export function getLaunchMgtJobEndpoint(managementJob: SystemJobTemplate) {
  const validJobTypes = [
    'cleanup_tokens',
    'cleanup_sessions',
    'cleanup_activitystream',
    'cleanup_jobs',
  ];

  if (validJobTypes.includes(managementJob.job_type)) {
    return awxAPI`/system_job_templates/${managementJob.id.toString()}/launch/`;
  } else {
    return undefined;
  }
}
