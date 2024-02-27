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

  // const launchCleanupTokensAndSessions = async (managementJob: SystemJobTemplate) => {
  //   const launchManagementJobEndpoint = getLaunchMgtJobEndpoint(managementJob);

  //   if (!launchManagementJobEndpoint) {
  //     return Promise.reject(new Error('Unable to retrieve management job launch configuration'));
  //   }

  //   try {
  //     const managementJobLaunch = await postRequest(launchManagementJobEndpoint, {});
  //     console.log(
  //       'Launching management launchCleanupTokensAndSessions:',
  //       managementJob.job_type,
  //       managementJobLaunch,
  //       launchManagementJobEndpoint
  //     );
  //     navigate(getJobOutputUrl(managementJobLaunch as SystemJobTemplate));
  //   } catch (error) {
  //     alertToaster.addAlert({
  //       variant: 'danger',
  //       title: t('Failed to launch management job'),
  //       children: error instanceof Error && error.message,
  //       timeout: 5000,
  //     });
  //   }
  // };

  // const launchOtherJobTypes = async (managementJob: SystemJobTemplate) => {
  //   const launchManagementJobEndpoint = getLaunchMgtJobEndpoint(managementJob);
  //   if (['cleanup_activitystream', 'cleanup_jobs'].includes(managementJob.job_type)) {
  //     const managementJobLaunch = await postRequest(launchManagementJobEndpoint, {
  //       extra_vars: { days: 3 },
  //     });
  //     navigate(getJobOutputUrl(managementJobLaunch as SystemJobTemplate));
  //   }
  // };

  // return { launchCleanupTokensAndSessions, launchOtherJobTypes };

  const launchManagementJob = async (
    managementJob: SystemJobTemplate,
    extra_vars?: number = 30
  ) => {
    const launchManagementJobEndpoint = getLaunchMgtJobEndpoint(managementJob);
    console.log(launchManagementJobEndpoint);
    if (!launchManagementJobEndpoint) {
      return Promise.reject(new Error('Unable to retrieve management job launch configuration'));
    }

    try {
      // const postData = extraVars ? { extra_vars: extra_vars } : {};
      // const managementJobLaunch = await postRequest(launchManagementJobEndpoint, {});

      //console.log('Launching management job:', managementJob.job_type, managementJobLaunch);

      let targetUrl;
      if (['cleanup_tokens', 'cleanup_sessions'].includes(managementJob.job_type)) {
        const managementJobLaunch = await postRequest(launchManagementJobEndpoint, {});
        // console.log('MANAGEMENT JOB LAUNCH T and S', managementJobLaunch, managementJob);
        targetUrl = getJobOutputUrl(managementJobLaunch as SystemJobTemplate);
      } else if (['cleanup_activitystream', 'cleanup_jobs'].includes(managementJob.job_type)) {
        const postData = extraVars ? { extra_vars: { days: extra_vars } } : {};
        const managementJobLaunch = await postRequest(launchManagementJobEndpoint, {
          postData,
        });
        // console.log('MANAGEMENT JOB LAUNCH S and J', managementJob.job_type);
        // console.log('MANAGEMENT JOB LAUNCH S and J', managementJobLaunch, managementJob);
        targetUrl = getJobOutputUrl(managementJobLaunch as SystemJobTemplate);
      }
      navigate(targetUrl);
    } catch (error) {
      alertToaster.addAlert({
        variant: 'danger',
        title: t('Failed to launch management job'),
        children: error instanceof Error && error.message,
        timeout: 5000,
      });
    }
  };
  return launchManagementJob;
}

export function getLaunchMgtJobEndpoint(managementJob: SystemJobTemplate) {
  const validJobTypes = [
    'cleanup_tokens',
    'cleanup_sessions',
    'cleanup_activitystream',
    'cleanup_jobs',
  ];
  console.log(managementJob, 'getLaunchMgtJobEndpoint');
  if (validJobTypes.includes(managementJob.job_type)) {
    return awxAPI`/system_job_templates/${managementJob.id.toString()}/launch/`;
  } else {
    return undefined;
  }
}
