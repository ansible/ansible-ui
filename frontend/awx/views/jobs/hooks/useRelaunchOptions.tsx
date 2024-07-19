import { useMemo } from 'react';
import { IPageAction, PageActionSelection, PageActionType } from '../../../../../framework';
import { ButtonVariant } from '@patternfly/react-core';
import { RocketIcon } from '@patternfly/react-icons';
import { UnifiedJob } from '../../../interfaces/UnifiedJob';
import { useRelaunchJob } from './useRelaunchJob';
import { useTranslation } from 'react-i18next';

export function useRelaunchOptions(): IPageAction<UnifiedJob>[] {
  const { t } = useTranslation();
  const relaunchJob = useRelaunchJob();
  const relaunchAllHosts = useRelaunchJob({ hosts: 'all' });
  const relaunchFailedHosts = useRelaunchJob({ hosts: 'failed' });
  const relaunchRunJobType = useRelaunchJob({ job_type: 'run' });
  const relaunchCheckJobType = useRelaunchJob({ job_type: 'check' });
  return useMemo(
    () => [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        variant: ButtonVariant.primary,
        isPinned: true,
        icon: RocketIcon,
        label: t(`Relaunch job`),
        isHidden: (job: UnifiedJob) =>
          !(job.type !== 'system_job' && job.summary_fields?.user_capabilities?.start) ||
          job.type === 'job',
        onClick: (job: UnifiedJob) => void relaunchJob(job),
      },
      {
        type: PageActionType.Dropdown,
        selection: PageActionSelection.Single,
        isPinned: true,
        icon: RocketIcon,
        label: t(`Relaunch job with`),
        isHidden: (job: UnifiedJob) => job.type !== 'job' || job.status === 'failed',
        actions: [
          {
            type: PageActionType.Button,
            selection: PageActionSelection.Single,
            label: t(`Job type run`),
            onClick: (job: UnifiedJob) => void relaunchRunJobType(job),
          },
          {
            type: PageActionType.Button,
            selection: PageActionSelection.Single,
            label: t(`Job type check`),
            onClick: (job: UnifiedJob) => void relaunchCheckJobType(job),
          },
        ],
      },
      {
        type: PageActionType.Dropdown,
        selection: PageActionSelection.Single,
        isPinned: true,
        icon: RocketIcon,
        label: t(`Relaunch using host parameters`),
        isHidden: (job: UnifiedJob) =>
          !(job.type !== 'system_job' && job.summary_fields?.user_capabilities?.start) ||
          !(job.status === 'failed' && job.type === 'job'),
        actions: [
          {
            type: PageActionType.Button,
            selection: PageActionSelection.Single,
            label: t(`Relaunch on all hosts`),
            onClick: (job: UnifiedJob) => void relaunchAllHosts(job),
          },
          {
            type: PageActionType.Button,
            selection: PageActionSelection.Single,
            label: t(`Relaunch on failed hosts`),
            onClick: (job: UnifiedJob) => void relaunchFailedHosts(job),
          },
        ],
      },
    ],
    [
      t,
      relaunchRunJobType,
      relaunchCheckJobType,
      relaunchAllHosts,
      relaunchFailedHosts,
      relaunchJob,
    ]
  );
}
