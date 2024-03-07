import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { usePageAlertToaster } from '../../../../../framework';
import { usePostRequest } from '../../../../common/crud/usePostRequest';
import { awxAPI } from '../../../common/api/awx-utils';
import { SystemJobTemplate } from '../../../interfaces/SystemJobTemplate';
import { useGetJobOutputUrl } from '../../../views/jobs/useGetJobOutputUrl';
import { useManagementJobPrompt } from '../hooks/useManagementJobPrompt';

export function useLaunchManagementJob() {
  const { t } = useTranslation();
  const launchManagementJobPrompt = useManagementJobPrompt();
  const navigate = useNavigate();
  const postRequest = usePostRequest();
  const alertToaster = usePageAlertToaster();
  const getJobOutputUrl = useGetJobOutputUrl();

  return async (managementJob: SystemJobTemplate) => {
    const launchManagementJobEndpoint = getLaunchMgtJobEndpoint(managementJob);
    if (!launchManagementJobEndpoint) {
      return Promise.reject(new Error('Unable to retrieve management job launch configuration'));
    }

    try {
      if (canLaunchWithoutPrompt(managementJob)) {
        const launchMgtJob = await postRequest(launchManagementJobEndpoint, {});
        navigate(getJobOutputUrl(launchMgtJob as SystemJobTemplate));
      } else {
        launchManagementJobPrompt(managementJob);
        console.log('launching management job with prompt...', managementJob);
        // const managementJobLaunch = await postRequest(launchManagementJobEndpoint, {
        //   extra_vars: { days: 2 },
        // });
        // navigate(getJobOutputUrl(managementJobLaunch as SystemJobTemplate));
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

export function canLaunchWithoutPrompt(launchMgtData: SystemJobTemplate) {
  return (
    launchMgtData.job_type === 'cleanup_tokens' || launchMgtData.job_type === 'cleanup_sessions'
  );
}
