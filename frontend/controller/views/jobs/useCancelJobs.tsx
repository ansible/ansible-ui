import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { BulkActionDialog, compareStrings, usePageDialog } from '../../../../framework'
import { useNameColumn } from '../../../common/columns'
import { getItemKey, requestPost } from '../../../Data'
import { UnifiedJob } from '../../interfaces/UnifiedJob'
import { useJobsColumns } from './Jobs'
import { getJobsAPIUrl } from './JobTypeAPIUrl'

export function useCancelJobs(callback: (jobs: UnifiedJob[]) => void) {
  const { t } = useTranslation()
  const [_, setDialog] = usePageDialog()
  const columns = useJobsColumns({ disableLinks: true, disableSort: true, displayIdWithName: true })
  const cancelActionNameColumn = useNameColumn({
    disableLinks: true,
    disableSort: true,
    displayIdWithName: true,
  })
  const errorColumns = useMemo(() => [cancelActionNameColumn], [cancelActionNameColumn])
  const cancelJobs = (jobs: UnifiedJob[]) => {
    setDialog(
      <BulkActionDialog<UnifiedJob>
        title={t('Cancel jobs', { count: jobs.length })}
        confirmText={t('Yes, I confirm that I want to cancel these {{count}} jobs.', {
          count: jobs.length,
        })}
        submitText={t('Cancel jobs', { count: jobs.length })}
        submitting={t('Canceling jobs', { count: jobs.length })}
        submittingTitle={t('Canceling {{count}} jobs', { count: jobs.length })}
        error={t('There were errors canceling jobs', { count: jobs.length })}
        items={jobs.sort((l, r) => compareStrings(l.name, r.name))}
        keyFn={getItemKey}
        isDanger
        columns={columns}
        errorColumns={errorColumns}
        onClose={callback}
        action={(job: UnifiedJob) =>
          requestPost(`${getJobsAPIUrl(job.type)}${job.id}/cancel/`, null)
        }
      />
    )
  }
  return cancelJobs
}
