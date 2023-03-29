import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { compareStrings, useBulkConfirmation } from '../../../../../framework';
import { useNameColumn } from '../../../../common/columns';
import { getItemKey, requestDelete } from '../../../../common/crud/Data';
import { UnifiedJob } from '../../../interfaces/UnifiedJob';
import { getJobsAPIUrl, isJobRunning } from '../jobUtils';
import { useJobsColumns } from './useJobsColumns';

export function useDeleteJobs(onComplete: (jobs: UnifiedJob[]) => void) {
  const { t } = useTranslation();
  const confirmationColumns = useJobsColumns({ disableLinks: true, disableSort: true });
  const deleteActionNameColumn = useNameColumn({ disableLinks: true, disableSort: true });
  const actionColumns = useMemo(() => [deleteActionNameColumn], [deleteActionNameColumn]);
  const bulkAction = useBulkConfirmation<UnifiedJob>();
  const cannotDeleteJobDueToPermissions = (job: UnifiedJob) => {
    if (!job.summary_fields.user_capabilities.delete && !isJobRunning(job.status))
      return t(`The job cannot be deleted due to insufficient permission`);
    return '';
  };
  const cannotDeleteJobDueToStatus = (job: UnifiedJob) => {
    if (isJobRunning(job.status)) return t(`The job cannot be deleted because it is running`);
    return '';
  };

  const deleteUnifiedJobs = (jobs: UnifiedJob[]) => {
    const undeletableJobsDueToStatus: UnifiedJob[] = jobs.filter(cannotDeleteJobDueToStatus);
    const nonRunningJobs: UnifiedJob[] = jobs.filter((job) => !isJobRunning(job.status));
    const undeletableJobsDueToPermissions: UnifiedJob[] = nonRunningJobs.filter(
      cannotDeleteJobDueToPermissions
    );

    bulkAction({
      title: t('Permanently delete jobs', { count: jobs.length }),
      confirmText: t('Yes, I confirm that I want to delete these {{count}} jobs.', {
        count:
          jobs.length - undeletableJobsDueToPermissions.length - undeletableJobsDueToStatus.length,
      }),
      actionButtonText: t('Delete jobs', { count: jobs.length }),
      items: jobs.sort((l, r) => compareStrings(l.name, r.name)),
      alertPrompts:
        undeletableJobsDueToStatus.length || undeletableJobsDueToPermissions.length
          ? [
              ...(undeletableJobsDueToStatus.length
                ? [
                    t(
                      '{{count}} of the selected jobs cannot be deleted because they are running.',
                      {
                        count: undeletableJobsDueToStatus.length,
                      }
                    ),
                  ]
                : []),
              ...(undeletableJobsDueToPermissions.length
                ? [
                    t(
                      '{{count}} of the selected jobs cannot be deleted due to insufficient permissions.',
                      {
                        count: undeletableJobsDueToPermissions.length,
                      }
                    ),
                  ]
                : []),
            ]
          : undefined,
      isItemNonActionable: (item: UnifiedJob) =>
        cannotDeleteJobDueToStatus(item)
          ? cannotDeleteJobDueToStatus(item)
          : cannotDeleteJobDueToPermissions(item),
      keyFn: getItemKey,
      isDanger: true,
      confirmationColumns,
      actionColumns,
      onComplete,
      actionFn: (job: UnifiedJob) => requestDelete(`${getJobsAPIUrl(job.type)}${job.id}/`),
    });
  };
  return deleteUnifiedJobs;
}
