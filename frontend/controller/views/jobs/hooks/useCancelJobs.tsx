import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { compareStrings, useBulkConfirmation } from '../../../../../framework'
import { useNameColumn } from '../../../../common/columns'
import { getItemKey, requestPost } from '../../../../Data'
import { UnifiedJob } from '../../../interfaces/UnifiedJob'
import { getJobsAPIUrl } from '../JobTypeAPIUrl'
import { useJobsColumns } from './useJobsColumns'

export function useCancelJobs(onComplete: (jobs: UnifiedJob[]) => void) {
  const { t } = useTranslation()
  const confirmationColumns = useJobsColumns({ disableLinks: true, disableSort: true })
  const cancelActionNameColumn = useNameColumn({ disableLinks: true, disableSort: true })
  const actionColumns = useMemo(() => [cancelActionNameColumn], [cancelActionNameColumn])
  const bulkAction = useBulkConfirmation<UnifiedJob>()
  const cancelUnifiedJobs = (jobs: UnifiedJob[]) => {
    bulkAction({
      title: t('Cancel jobs', { count: jobs.length }),
      confirmText: t('Yes, I confirm that I want to cancel these {{count}} jobs.', {
        count: jobs.length,
      }),
      actionButtonText: t('Cancel jobs', { count: jobs.length }),
      items: jobs.sort((l, r) => compareStrings(l.name, r.name)),
      keyFn: getItemKey,
      confirmationColumns,
      actionColumns,
      onComplete,
      actionFn: (job: UnifiedJob) =>
        requestPost(`${getJobsAPIUrl(job.type)}${job.id}/cancel/`, null),
    })
  }
  return cancelUnifiedJobs
}
