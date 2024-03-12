import { ButtonVariant } from '@patternfly/react-core';
import { MinusCircleIcon, RocketIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { IPageAction, PageActionSelection, PageActionType } from '../../../../../framework';
import { UnifiedJob } from '../../../interfaces/UnifiedJob';
import { isJobRunning } from '../jobUtils';
import { useCancelJobs } from './useCancelJobs';
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
  const relaunchJob = useRelaunchJob();

  return useMemo<IPageAction<UnifiedJob>[]>(() => {
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
        isHidden: (job: UnifiedJob) => Boolean(cannotCancelJob(job, t)),
        onClick: (job: UnifiedJob) => cancelJobs([job]),
      },
    ];
    return actions;
  }, [cancelJobs, relaunchJob, t]);
}
