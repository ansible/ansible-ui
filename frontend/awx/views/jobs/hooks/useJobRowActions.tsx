import { ButtonVariant } from '@patternfly/react-core';
import { MinusCircleIcon, RocketIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { IPageAction, PageActionSelection, PageActionType } from '../../../../../framework';
import { UnifiedJob } from '../../../interfaces/UnifiedJob';
import { isJobRunning } from '../jobUtils';
import { useCancelJobs } from './useCancelJobs';
import { useDeleteJobs } from './useDeleteJobs';
import { useRelaunchJob } from './useRelaunchJob';

export function useJobRowActions(onComplete: (jobs: UnifiedJob[]) => void) {
  const { t } = useTranslation();
  const deleteJobs = useDeleteJobs(onComplete);
  const cancelJobs = useCancelJobs(onComplete);
  const relaunchJob = useRelaunchJob();
  const relaunchAllHosts = useRelaunchJob({ hosts: 'all' });
  const relaunchFailedHosts = useRelaunchJob({ hosts: 'failed' });

  return useMemo<IPageAction<UnifiedJob>[]>(() => {
    const cannotDeleteJob = (job: UnifiedJob) => {
      if (!job.summary_fields.user_capabilities.delete)
        return t(`The job cannot be deleted due to insufficient permission`);
      else if (isJobRunning(job.status))
        return t(`The job cannot be deleted due to a running job status`);
      return '';
    };

    const cannotCancelJob = (job: UnifiedJob) => {
      if (!isJobRunning(job.status))
        return t(`The job cannot be canceled because it is not running`);
      else if (!job.summary_fields.user_capabilities.start)
        return t(`The job cannot be canceled due to insufficient permission`);
      else return '';
    };

    const actions: IPageAction<UnifiedJob>[] = [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        variant: ButtonVariant.secondary,
        isPinned: true,
        icon: MinusCircleIcon,
        label: t(`Cancel job`),
        isHidden: (job: UnifiedJob) => Boolean(cannotCancelJob(job)),
        onClick: (job: UnifiedJob) => cancelJobs([job]),
      },
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
        // variant: ButtonVariant.secondary,
        selection: PageActionSelection.Single,
        isPinned: true,
        icon: RocketIcon,
        // iconOnly: true,
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
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: TrashIcon,
        label: t(`Delete job`),
        isDisabled: (job: UnifiedJob) => cannotDeleteJob(job),
        onClick: (job: UnifiedJob) => deleteJobs([job]),
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: MinusCircleIcon,
        label: t(`Cancel job`),
        isDisabled: (job: UnifiedJob) => cannotCancelJob(job),
        isHidden: (job: UnifiedJob) => Boolean(!cannotCancelJob(job)), // Hidden when a job is running and cancellable since we have the iconOnly row action will also be available to trigger cancel in that scenario
        onClick: (job: UnifiedJob) => cancelJobs([job]),
      },
    ];
    return actions;
  }, [deleteJobs, cancelJobs, relaunchJob, relaunchAllHosts, relaunchFailedHosts, t]);
}
