import { ButtonVariant } from '@patternfly/react-core';
import { BanIcon, RocketIcon, TrashIcon, MinusCircleIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { IPageAction, PageActionType } from '../../../../../framework';
import { UnifiedJob } from '../../../interfaces/UnifiedJob';
import { isJobRunning } from '../jobUtils';
import { useCancelJobs } from './useCancelJobs';
import { useDeleteJobs } from './useDeleteJobs';
import { useRelaunchJob } from './useRelaunchJob';

export function useJobRowActions(onComplete: (jobs: UnifiedJob[]) => void) {
  const { t } = useTranslation();
  const deleteJobs = useDeleteJobs(onComplete);
  const cancelJobs = useCancelJobs(onComplete);
  const relaunchJob = useRelaunchJob(onComplete);
  const relaunchAllHosts = useRelaunchJob(onComplete, { hosts: 'all' });
  const relaunchFailedHosts = useRelaunchJob(onComplete, { hosts: 'failed' });

  return useMemo<IPageAction<UnifiedJob>[]>(() => {
    const cannotDeleteJob = (job: UnifiedJob) => {
      if (!job.summary_fields.user_capabilities.delete)
        return t(`The job cannot be deleted due to insufficient permission`);
      else if (isJobRunning(job.status))
        return t(`The job cannot be deleted due to a running job status`);
      return '';
    };

    const cannotCancelJob = (job: UnifiedJob) => {
      if (!job.summary_fields.user_capabilities.start && isJobRunning(job.status))
        return t(`The job cannot be canceled due to insufficient permission`);
      else if (!isJobRunning(job.status))
        return t(`The job cannot be canceled because it is not running`);
      return '';
    };

    return [
      {
        type: PageActionType.single,
        variant: ButtonVariant.secondary,
        icon: MinusCircleIcon,
        label: t(`Cancel job`),
        isHidden: (job: UnifiedJob) => Boolean(cannotCancelJob(job)),
        onClick: (job: UnifiedJob) => cancelJobs([job]),
      },
      {
        type: PageActionType.single,
        variant: ButtonVariant.secondary,
        icon: RocketIcon,
        label: t(`Relaunch job`),
        isHidden: (job: UnifiedJob) =>
          !(job.type !== 'system_job' && job.summary_fields?.user_capabilities?.start) ||
          (job.status === 'failed' && job.type === 'job'),
        onClick: (job: UnifiedJob) => void relaunchJob(job),
      },
      {
        type: PageActionType.dropdown,
        variant: ButtonVariant.secondary,
        icon: RocketIcon,
        iconOnly: true,
        label: t(`Relaunch using host parameters`),
        isHidden: (job: UnifiedJob) =>
          !(job.type !== 'system_job' && job.summary_fields?.user_capabilities?.start) ||
          !(job.status === 'failed' && job.type === 'job'),
        options: [
          {
            type: PageActionType.single,
            label: t(`Relaunch on all hosts`),
            onClick: (job: UnifiedJob) => void relaunchAllHosts(job),
          },
          {
            type: PageActionType.single,
            label: t(`Relaunch on failed hosts`),
            onClick: (job: UnifiedJob) => void relaunchFailedHosts(job),
          },
        ],
      },
      {
        type: PageActionType.single,
        icon: TrashIcon,
        label: t(`Delete job`),
        isDisabled: (job: UnifiedJob) => cannotDeleteJob(job),
        onClick: (job: UnifiedJob) => deleteJobs([job]),
      },
      {
        type: PageActionType.single,
        icon: BanIcon,
        label: t(`Cancel job`),
        isDisabled: (job: UnifiedJob) => cannotCancelJob(job),
        onClick: (job: UnifiedJob) => cancelJobs([job]),
      },
    ];
  }, [deleteJobs, cancelJobs, relaunchJob, relaunchAllHosts, relaunchFailedHosts, t]);
}
