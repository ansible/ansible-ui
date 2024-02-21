import { RocketIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { IPageAction, PageActionSelection, PageActionType } from '../../../../../framework';
import { SystemJobTemplate } from '../../../interfaces/SystemJobTemplate';
import { useManagementJobPrompt } from './useManagementJobPrompt';

// import { useAwxActiveUser } from '../../../common/useAwxActiveUser';
import { useLaunchManagementJob } from './useLaunchManagementJob';

export function useManagementJobRowActions(managementJob: SystemJobTemplate) {
  const { t } = useTranslation();
  const onManagementJobPrompt = useManagementJobPrompt(managementJob);
  const { launchCleanupTokensAndSessions, launchOtherJobTypes } =
    useLaunchManagementJob(managementJob);

  return useMemo<IPageAction<SystemJobTemplate>[]>(() => {
    async function handleManagementJob(managementJob: SystemJobTemplate) {
      const isPrompted = ['cleanup_activitystream', 'cleanup_jobs'].includes(
        managementJob.job_type
      );
      console.log('Launching management job:', managementJob);
      console.log('isPrompted:', isPrompted);
      if (isPrompted) {
        launchOtherJobTypes(managementJob);
      } else if (
        managementJob.job_type === 'cleanup_tokens' ||
        managementJob.job_type === 'cleanup_sessions'
      ) {
        //console.log('Launching management job from cleanup sessions and tokens:', managementJob);
        await launchCleanupTokensAndSessions(managementJob);
      }
    }

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
