import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { compareStrings } from '../../../../../framework';
import { useNameColumn } from '../../../../common/columns';
import { getItemKey, requestDelete } from '../../../../common/crud/Data';
import { awxAPI } from '../../../common/api/awx-utils';
import { useAwxBulkConfirmation } from '../../../common/useAwxBulkConfirmation';
import { useInventoryJobsColumns } from './useInventoryJobsColumns';
import { Job } from '../../../interfaces/Job';

export function useDeleteJobs(onComplete: (jobs: Job[]) => void) {
  const { t } = useTranslation();
  const confirmationColumns = useInventoryJobsColumns({ disableLinks: true, disableSort: true });
  const deleteActionNameColumn = useNameColumn({ disableLinks: true, disableSort: true });
  const actionColumns = useMemo(() => [deleteActionNameColumn], [deleteActionNameColumn]);
  const bulkAction = useAwxBulkConfirmation<Job>();
  const deleteProjects = (jobs: Job[]) => {
    bulkAction({
      title: t('Permanently delete projects', { count: jobs.length }),
      confirmText: t('Yes, I confirm that I want to delete these {{count}} projects.', {
        count: jobs.length,
      }),
      actionButtonText: t('Delete projects', { count: jobs.length }),
      items: jobs.sort((l, r) => compareStrings(l.name, r.name)),
      keyFn: getItemKey,
      isDanger: true,
      confirmationColumns,
      actionColumns,
      onComplete,
      actionFn: (job: Job, signal) => requestDelete(awxAPI`/jobs/${job.id.toString()}/`, signal),
    });
  };
  return deleteProjects;
}
