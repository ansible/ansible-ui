import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { compareStrings, useBulkConfirmation } from '../../../../../framework';
import { useNameColumn } from '../../../../common/columns';
import { getItemKey, requestPost } from '../../../../common/crud/Data';
import { UnifiedJob } from '../../../interfaces/UnifiedJob';
import { getJobsAPIUrl, isJobRunning } from '../jobUtils';
import { useJobsColumns } from './useJobsColumns';

export function useCancelJobs(onComplete: (jobs: UnifiedJob[]) => void) {
  const { t } = useTranslation();
  const confirmationColumns = useJobsColumns({ disableLinks: true, disableSort: true });
  const cancelActionNameColumn = useNameColumn({ disableLinks: true, disableSort: true });
  const actionColumns = useMemo(() => [cancelActionNameColumn], [cancelActionNameColumn]);
  const bulkAction = useBulkConfirmation<UnifiedJob>();
  const cannotCancelJobDueToPermissions = (job: UnifiedJob) => {
    if (!job.summary_fields.user_capabilities.start && isJobRunning(job.status))
      return t(`The job cannot be canceled due to insufficient permission`);
    return '';
  };
  const cannotCancelJobDueToStatus = (job: UnifiedJob) => {
    if (!isJobRunning(job.status)) return t(`The job cannot be canceled because it is not running`);
    return '';
  };

  const cancelUnifiedJobs = (jobs: UnifiedJob[]) => {
    const uncancellableJobsDueToStatus: UnifiedJob[] = jobs.filter(cannotCancelJobDueToStatus);
    const runningJobs: UnifiedJob[] = jobs.filter((job) => isJobRunning(job.status));
    const uncancellableJobsDueToPermissions: UnifiedJob[] = runningJobs.filter(
      cannotCancelJobDueToPermissions
    );

    bulkAction({
      title: t('Cancel jobs', { count: jobs.length }),
      confirmText: t('Yes, I confirm that I want to cancel these {{count}} jobs.', {
        count:
          jobs.length -
          uncancellableJobsDueToPermissions.length -
          uncancellableJobsDueToStatus.length,
      }),
      actionButtonText: t('Cancel jobs', { count: jobs.length }),
      items: jobs.sort((l, r) => compareStrings(l.name, r.name)),
      alertPrompts:
        uncancellableJobsDueToStatus.length || uncancellableJobsDueToPermissions.length
          ? [
              ...(uncancellableJobsDueToStatus.length
                ? [
                    t(
                      '{{count}} of the selected jobs cannot be cancelled because they are not running.',
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
      isItemNonActionable: (item: UnifiedJob) =>
        cannotCancelJobDueToStatus(item)
          ? cannotCancelJobDueToStatus(item)
          : cannotCancelJobDueToPermissions(item),
      keyFn: getItemKey,
      confirmationColumns,
      actionColumns,
      onComplete,
      actionFn: (job: UnifiedJob) =>
        requestPost(`${getJobsAPIUrl(job.type)}${job.id}/cancel/`, null),
    });
  };
  return cancelUnifiedJobs;
}
