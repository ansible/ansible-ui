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
  return useMemo(
    () => [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        variant: ButtonVariant.secondary,
        isPinned: true,
        icon: RocketIcon,
        label: t(`Relaunch job`),
        isHidden: (job: UnifiedJob) =>
          !(job.type !== 'system_job' && job.summary_fields?.user_capabilities?.start) ||
          (job.status === 'failed' && job.type === 'job'),
        onClick: (job: UnifiedJob) => void relaunchJob(job),
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
    [t, relaunchAllHosts, relaunchFailedHosts, relaunchJob]
  );
}
