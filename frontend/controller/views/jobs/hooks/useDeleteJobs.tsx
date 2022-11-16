import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { compareStrings, useBulkConfirmation } from '../../../../../framework'
import { useNameColumn } from '../../../../common/columns'
import { getItemKey, requestDelete } from '../../../../Data'
import { UnifiedJob } from '../../../interfaces/UnifiedJob'
import { getJobsAPIUrl } from '../JobTypeAPIUrl'
import { useJobsColumns } from './useJobsColumns'

export function useDeleteJobs(onComplete: (jobs: UnifiedJob[]) => void) {
  const { t } = useTranslation()
  const confirmationColumns = useJobsColumns({
    disableLinks: true,
    disableSort: true,
    displayIdWithName: true,
  })
  const deleteActionNameColumn = useNameColumn({
    disableLinks: true,
    disableSort: true,
    displayIdWithName: true,
  })
  const actionColumns = useMemo(() => [deleteActionNameColumn], [deleteActionNameColumn])
  const bulkAction = useBulkConfirmation<UnifiedJob>()
  const deleteUnifiedJobs = (jobs: UnifiedJob[]) => {
    bulkAction({
      title: t('Permanently delete jobs', { count: jobs.length }),
      confirmText: t('Yes, I confirm that I want to delete these {{count}} jobs.', {
        count: jobs.length,
      }),
      actionButtonText: t('Delete jobs', { count: jobs.length }),
      items: jobs.sort((l, r) => compareStrings(l.name, r.name)),
      keyFn: getItemKey,
      isDanger: true,
      confirmationColumns,
      actionColumns,
      onComplete,
      actionFn: (job: UnifiedJob) => requestDelete(`${getJobsAPIUrl(job.type)}${job.id}/`),
    })
  }
  return deleteUnifiedJobs
}
