import { ButtonVariant } from '@patternfly/react-core';
import { DownloadIcon, MinusCircleIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { IPageAction, PageActionSelection, PageActionType } from '../../../../../framework';
import { UnifiedJob } from '../../../interfaces/UnifiedJob';
import { isJobRunning } from '../jobUtils';
import { useCancelJobs } from './useCancelJobs';
import { useDeleteJobs } from './useDeleteJobs';
import { TFunction } from 'i18next';
import { useDownloadJobOutput } from './useDownloadJobOutput';
import { useRelaunchOptions } from './useRelaunchOptions';

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
  const downloadJobOutput = useDownloadJobOutput();
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
      ...relaunchOptions,
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
        icon: DownloadIcon,
        label: t(`Download output`),
        onClick: (job: UnifiedJob) => downloadJobOutput(job),
        ouiaId: 'job-detail-download-button',
        isHidden: (job: UnifiedJob) => !job.related.stdout,
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
  }, [cancelJobs, deleteJobs, relaunchOptions, downloadJobOutput, t]);
}
