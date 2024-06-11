import { ButtonVariant } from '@patternfly/react-core';
import { MinusCircleIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { IPageAction, PageActionSelection, PageActionType } from '../../../../../framework';
import { UnifiedJob } from '../../../interfaces/UnifiedJob';
import { isJobRunning } from '../jobUtils';
import { useCancelJobs } from './useCancelJobs';
import { useDeleteJobs } from './useDeleteJobs';
import { cannotCancelJob } from './useJobHeaderActions';
import { useRelaunchOptions } from './useRelaunchOptions';

export function useJobRowActions(onComplete: (jobs: UnifiedJob[]) => void) {
  const { t } = useTranslation();
  const deleteJobs = useDeleteJobs(onComplete);
  const cancelJobs = useCancelJobs(onComplete);
  const relaunchOptions = useRelaunchOptions();
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
        icon: MinusCircleIcon,
        label: t(`Cancel job`),
        isHidden: (job: UnifiedJob) => Boolean(cannotCancelJob(job, t)),
        onClick: (job: UnifiedJob) => cancelJobs([job]),
      },
      ...relaunchOptions,
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: MinusCircleIcon,
        label: t(`Cancel job`),
        isDisabled: (job: UnifiedJob) => cannotCancelJob(job, t),
        isHidden: (job: UnifiedJob) => Boolean(!cannotCancelJob(job, t)), // Hidden when a job is running and cancellable since we have the iconOnly row action will also be available to trigger cancel in that scenario
        onClick: (job: UnifiedJob) => cancelJobs([job]),
      },
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: TrashIcon,
        label: t(`Delete job`),
        isDisabled: (job: UnifiedJob) => cannotDeleteJob(job),
        onClick: (job: UnifiedJob) => deleteJobs([job]),
        isDanger: true,
      },
    ];
    return actions;
  }, [deleteJobs, cancelJobs, relaunchOptions, t]);
}
