import { RocketIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  useGetPageUrl,
} from '../../../../../framework';
import { AwxRoute } from '../../../main/AwxRoutes';
import { SystemJobTemplate } from '../../../interfaces/SystemJobTemplate';
import { useManagementJobPrompt } from './useManagementJobPrompt';
import { usePageNavigate } from '../../../../../framework';
// import { useAwxActiveUser } from '../../../common/useAwxActiveUser';
import { useLaunchManagementJob } from './useLaunchManagementJob';

export function useManagementJobRowActions(managementJob: SystemJobTemplate) {
  const { t } = useTranslation();
  const onManagementJobPrompt = useManagementJobPrompt(managementJob);
  //const pageNavigate = usePageNavigate();
  const { launchCleanupTokensAndSessions, launchOtherJobTypes } = useLaunchManagementJob();
  //const pageNavigate = usePageNavigate();
  //const isPrompted = ['cleanup_activitystream', 'cleanup_jobs'].includes(managementJob.job_type);

  //console.log('Launching management job:', managementJob.job_type);
  return useMemo<IPageAction<SystemJobTemplate>[]>(() => {
    async function handleManagementJob(managementJob: SystemJobTemplate) {
      const isPrompted = ['cleanup_activitystream', 'cleanup_jobs'].includes(
        managementJob.job_type
      );
      console.log('Launching management job:', managementJob);
      console.log('isPrompted:', isPrompted);
      if (isPrompted) {
        onManagementJobPrompt(managementJob);
      } else if (
        managementJob.job_type === 'cleanup_tokens' ||
        managementJob.job_type === 'cleanup_sessions'
      ) {
        await launchCleanupTokensAndSessions(managementJob);
      } else {
        launchOtherJobTypes(managementJob);
      }
    }
    // function handleManagementJob(managementJob: SystemJobTemplate) {
    //   const isPrompted = ['cleanup_activitystream', 'cleanup_jobs'].includes(
    //     managementJob.job_type
    //   );
    //   console.log('Launching management job:', managementJob);
    //   console.log('isPrompted:', isPrompted);
    //   if (isPrompted) {
    //     onManagementJobPrompt(managementJob); // Ensure that the Promise is awaited
    //   } else {
    //     pageNavigate(AwxRoute.JobOutput, { params: { id: managementJob.id } });
    //   }
    // }

    const rowActions: IPageAction<SystemJobTemplate> = [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: RocketIcon,
        label: t('Launch management job'),
        onClick: (managementJob: SystemJobTemplate) => handleManagementJob(managementJob),
        // isDisabled: !activeUser?.is_superuser,
        ouiaId: 'management-job-launch-button',
        isDanger: false,
        isPinned: true,
      },
    ];
    return rowActions;
  }, [onManagementJobPrompt, launchCleanupTokensAndSessions, launchOtherJobTypes, t]);
}
