import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { BulkConfirmationDialog, compareStrings, usePageDialog } from '../../../../../framework'
import { useNameColumn } from '../../../../common/columns'
import { getItemKey, requestDelete } from '../../../../Data'
import { UnifiedJob } from '../../../interfaces/UnifiedJob'
import { getJobsAPIUrl } from '../JobTypeAPIUrl'
import { useJobsColumns } from './useJobsColumns'

export function useDeleteJobs(callback: (jobs: UnifiedJob[]) => void) {
  const { t } = useTranslation()
  const [_, setDialog] = usePageDialog()
  const columns = useJobsColumns({ disableLinks: true, disableSort: true, displayIdWithName: true })
  const deleteActionNameColumn = useNameColumn({
    disableLinks: true,
    disableSort: true,
    displayIdWithName: true,
  })
  const errorColumns = useMemo(() => [deleteActionNameColumn], [deleteActionNameColumn])
  const deleteJobs = (jobs: UnifiedJob[]) => {
    setDialog(
      <BulkConfirmationDialog<UnifiedJob>
        title={t('Permanently delete jobs', { count: jobs.length })}
        confirmText={t('Yes, I confirm that I want to delete these {{count}} jobs.', {
          count: jobs.length,
        })}
        submitText={t('Delete jobs', { count: jobs.length })}
        submitting={t('Deleting jobs', { count: jobs.length })}
        submittingTitle={t('Deleting {{count}} jobs', { count: jobs.length })}
        error={t('There were errors deleting jobs', { count: jobs.length })}
        items={jobs.sort((l, r) => compareStrings(l.name, r.name))}
        keyFn={getItemKey}
        isDanger
        columns={columns}
        errorColumns={errorColumns}
        onConfirm={callback}
        action={(job: UnifiedJob) => requestDelete(`${getJobsAPIUrl(job.type)}${job.id}/`)}
      />
    )
  }
  return deleteJobs
}
