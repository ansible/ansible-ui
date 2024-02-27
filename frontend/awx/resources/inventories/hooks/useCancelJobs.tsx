import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { compareStrings } from '../../../../../framework';
import { useNameColumn } from '../../../../common/columns';
import { getItemKey } from '../../../../common/crud/Data';
import { usePostRequest } from '../../../../common/crud/usePostRequest';
import { awxAPI } from '../../../common/api/awx-utils';
import { useAwxBulkConfirmation } from '../../../common/useAwxBulkConfirmation';
import { useInventoryJobsColumns } from './useInventoryJobsColumns';
import { Job } from '../../../interfaces/Job';
import { TFunction } from 'i18next';

function isJobRunning(status: string) {
  return ['pending', 'waiting', 'running'].includes(status);
}

export const cannotCancelJobDueToStatus = (
  job: Job,
  t: TFunction<'translation', undefined>
): string => {
  if (!isJobRunning(job.status ?? '')) {
    return t(`The job cannot be canceled because it is not running`);
  }
  return '';
};

export function useCancelJobs(onComplete?: (jobs: Job[]) => void) {
  const { t } = useTranslation();
  const confirmationColumns = useInventoryJobsColumns({ disableLinks: true, disableSort: true });
  const cancelActionNameColumn = useNameColumn({ disableLinks: true, disableSort: true });
  const actionColumns = useMemo(() => [cancelActionNameColumn], [cancelActionNameColumn]);
  const bulkAction = useAwxBulkConfirmation<Job>();
  const postRequest = usePostRequest();

  const cannotCancelJobDueToPermissions = (job: Job) => {
    if (!job.summary_fields?.user_capabilities?.start)
      return t(`The job cannot be canceled due to insufficient permission`);
    return '';
  };

  const cancelJobs = (jobs: Job[]) => {
    const uncancellableJobsDueToStatus: Job[] = jobs.filter((job) =>
      cannotCancelJobDueToStatus(job, t)
    );
    const runningJobs: Job[] = jobs.filter((job) => isJobRunning(job.status ?? ''));
    const uncancellableJobsDueToPermissions: Job[] = runningJobs.filter(
      cannotCancelJobDueToPermissions
    );

    bulkAction({
      title: t('Cancel job', { count: jobs.length }),
      confirmText: t('Yes, I confirm that I want to cancel these {{count}} jobs.', {
        count:
          jobs.length -
          uncancellableJobsDueToPermissions.length -
          uncancellableJobsDueToStatus.length,
      }),
      actionButtonText: t('Cancel job', { count: jobs.length }),
      items: jobs.sort((l, r) => compareStrings(l.name, r.name)),
      alertPrompts:
        uncancellableJobsDueToStatus.length || uncancellableJobsDueToPermissions.length
          ? [
              ...(uncancellableJobsDueToStatus.length
                ? [
                    t(
                      '{{count}} of the selected jobs cannot be canceled because they are not running.',
                      {
                        count: uncancellableJobsDueToStatus.length,
                      }
                    ),
                  ]
                : []),
              ...(uncancellableJobsDueToPermissions.length
                ? [
                    t(
                      '{{count}} of the selected jobs cannot be cancelled due to insufficient permissions.',
                      {
                        count: uncancellableJobsDueToPermissions.length,
                      }
                    ),
                  ]
                : []),
            ]
          : undefined,
      isItemNonActionable: (item: Job) =>
        cannotCancelJobDueToStatus(item, t)
          ? cannotCancelJobDueToStatus(item, t)
          : cannotCancelJobDueToPermissions(item),
      keyFn: getItemKey,
      confirmationColumns,
      actionColumns,
      onComplete,
      actionFn: (job: Job) => postRequest(awxAPI`/jobs/${job?.id.toString() ?? ''}/cancel/`, {}),
    });
  };
  return cancelJobs;
}
