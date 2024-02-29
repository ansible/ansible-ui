import { RocketIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { IPageAction, PageActionSelection, PageActionType } from '../../../../../framework';
import { SystemJobTemplate } from '../../../interfaces/SystemJobTemplate';
import { useManagementJobPrompt } from './useManagementJobPrompt';
import { useLaunchManagementJob } from './useLaunchManagementJob';

export function useManagementJobRowActions() {
  const { t } = useTranslation();
  const managementJobPrompt = useManagementJobPrompt();
  const launchManagementJob = useLaunchManagementJob();

  return useMemo<IPageAction<SystemJobTemplate>[]>(() => {
    async function handleManagementJob(managementJob: SystemJobTemplate) {
      if (
        managementJob.job_type === 'cleanup_activitystream' ||
        managementJob.job_type === 'cleanup_jobs'
      ) {
        managementJobPrompt(managementJob);
      } else if (
        managementJob.job_type === 'cleanup_tokens' ||
        managementJob.job_type === 'cleanup_sessions'
      ) {
        await launchManagementJob(managementJob);
      }
    }

    const rowActions: IPageAction<SystemJobTemplate> = [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: RocketIcon,
        label: t('Launch management job'),
        onClick: (job: SystemJobTemplate) => handleManagementJob(job),
        // isDisabled: !activeUser?.is_superuser,
        ouiaId: 'management-job-launch-button',
        isDanger: false,
        isPinned: true,
      },
    ];
    return rowActions;
  }, [launchManagementJob, managementJobPrompt, t]);
}
