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
import { TFunction } from 'i18next';

export const cannotCancelJob = (job: UnifiedJob, t: TFunction<'translation', undefined>) => {
  if (!isJobRunning(job.status)) return t(`The job cannot be canceled because it is not running`);
  else if (!job.summary_fields.user_capabilities.start)
    return t(`The job cannot be canceled due to insufficient permission`);
  else return '';
};

export function useJobHeaderActions(onComplete: (jobs: UnifiedJob[]) => void) {
  const { t } = useTranslation();
  const cancelJobs = useCancelJobs(onComplete);
  const deleteJobs = useDeleteJobs(onComplete);
  const relaunchJob = useRelaunchJob();

  return useMemo<IPageAction<UnifiedJob>[]>(() => {
    const cannotDeleteJob = (job: UnifiedJob) => {
      if (!job.summary_fields.user_capabilities.delete)
        return t(`The job cannot be deleted due to insufficient permission`);
      else if (isJobRunning(job.status))
        return t(`The job cannot be deleted due to a running job status`);
      return '';
    };

    const actions: IPageAction<UnifiedJob>[] = [
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
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        variant: ButtonVariant.secondary,
        isPinned: true,
        icon: MinusCircleIcon,
        label: t(`Cancel job`),
        isDisabled: (job: UnifiedJob) => cannotCancelJob(job, t),
        onClick: (job: UnifiedJob) => cancelJobs([job]),
      },
      { type: PageActionType.Seperator },

      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: TrashIcon,
        label: t(`Delete job`),
        isDisabled: (job: UnifiedJob) => cannotDeleteJob(job),
        onClick: (job: UnifiedJob) => {
          if (!job) return;
          deleteJobs([job]);
        },
        ouiaId: 'job-detail-delete-button',
        isDanger: true,
      },
    ];
    return actions;
  }, [cancelJobs, deleteJobs, relaunchJob, t]);
}
