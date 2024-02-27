import { MinusCircleIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { IPageAction, PageActionSelection, PageActionType } from '../../../../../framework';
import { useOptions } from '../../../../common/crud/useOptions';
import { awxAPI } from '../../../common/api/awx-utils';
import { ActionsResponse, OptionsResponse } from '../../../interfaces/OptionsResponse';
import { Job } from '../../../interfaces/Job';
import { useCancelJobs, cannotCancelJobDueToStatus } from './useCancelJobs';
import { useDeleteJobs } from './useDeleteInventoryJobs';

export function useJobsToolbarActions(onComplete: (jobs: Job[]) => void) {
  const { t } = useTranslation();
  const { data } = useOptions<OptionsResponse<ActionsResponse>>(awxAPI`/inventory_sources/`);

  const deleteJobs = useDeleteJobs(onComplete);
  const cancelJobs = useCancelJobs(onComplete);

  const JobToolbarActions = useMemo<IPageAction<Job>[]>(() => {
    const canDeleteJob = (jobs: Job[]): string => {
      if (!data?.actions?.['POST']) {
        return t(
          'You do not have permission to delete a job. Please contact your organization administrator if there is an issue with your access.'
        );
      }
      if (jobs.length === 0) {
        return t(`Select at least one item from the list.`);
      }
      return '';
    };

    const canCancelJobs = (jobs: Job[]): string => {
      let msg = '';

      jobs.forEach((job) => {
        msg = cannotCancelJobDueToStatus(job, t);
      });
      return msg;
    };
    return [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        isPinned: true,
        icon: TrashIcon,
        label: t('Delete'),
        onClick: (jobs: Job[]) => deleteJobs(jobs),
        isDisabled: (jobs: Job[]) => canDeleteJob(jobs),
        isDanger: true,
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        isPinned: true,
        icon: MinusCircleIcon,
        label: t('Cancel Jobs'),
        onClick: (jobs: Job[]) => cancelJobs(jobs),
        isDisabled: (jobs: Job[]) => canDeleteJob(jobs) || canCancelJobs(jobs),
      },
    ];
  }, [cancelJobs, data?.actions, deleteJobs, t]);

  return JobToolbarActions;
}
