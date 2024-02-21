import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { usePageAlertToaster } from '../../../../../framework';
import { usePostRequest } from '../../../../common/crud/usePostRequest';
import { awxAPI } from '../../../common/api/awx-utils';
import { SystemJobTemplate } from '../../../interfaces/SystemJobTemplate';
//import { AwxRoute } from '../../../main/AwxRoutes';
import { useGetJobOutputUrl } from '../../../views/jobs/useGetJobOutputUrl';

export function useLaunchManagementJob() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const postRequest = usePostRequest();
  const alertToaster = usePageAlertToaster();
  const getJobOutputUrl = useGetJobOutputUrl();

  const launchCleanupTokensAndSessions = async (managementJob: SystemJobTemplate) => {
    const launchManagementJobEndpoint = getLaunchMgtJobEndpoint(managementJob);
    //console.log(typeof launchManagementJobEndpoint, launchManagementJobEndpoint);

    if (!launchManagementJobEndpoint) {
      return Promise.reject(new Error('Unable to retrieve management job launch configuration'));
      //throw new Error('Unable to retrieve management job launch configuration');
    }

    try {
      const managementJobLaunch = await postRequest(launchManagementJobEndpoint, {});
      //console.log(typeof managementJobLaunch, managementJobLaunch);
      console.log(
        'Launching management launchCleanupTokensAndSessions:',
        managementJob.job_type,
        managementJobLaunch
      );
      navigate(getJobOutputUrl(managementJobLaunch as SystemJobTemplate));
    } catch (error) {
      alertToaster.addAlert({
        variant: 'danger',
        title: t('Failed to launch management job'),
        children: error instanceof Error && error.message,
        timeout: 5000,
      });
    }
  };

  const launchOtherJobTypes = (managementJob: SystemJobTemplate) => {
    console.log('Launching management jobeeeeeee:', managementJob.job_type);
    //navigate(getJobOutputUrl(managementJob));
  };

  return { launchCleanupTokensAndSessions, launchOtherJobTypes };
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
