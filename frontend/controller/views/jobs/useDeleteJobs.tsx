import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { BulkActionDialog, compareStrings, usePageDialog } from '../../../../framework'
import { useNameColumn } from '../../../common/columns'
import { getItemKey, requestDelete } from '../../../Data'
import { UnifiedJob } from '../../interfaces/UnifiedJob'
import { useJobsColumns } from './Jobs'

export function useDeleteJobs(callback: (jobs: UnifiedJob[]) => void) {
  const { t } = useTranslation()
  const [_, setDialog] = usePageDialog()
  const columns = useJobsColumns({ disableLinks: true, disableSort: true })
  const deleteActionNameColumn = useNameColumn({ disableLinks: true, disableSort: true })
  const errorColumns = useMemo(() => [deleteActionNameColumn], [deleteActionNameColumn])
  const deleteTemplates = (jobs: UnifiedJob[]) => {
    setDialog(
      <BulkActionDialog<UnifiedJob>
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
        onClose={callback}
        action={(job: UnifiedJob) => requestDelete(`/api/v2/jobs/${job.id}/`)}
      />
    )
  }
  return deleteTemplates
}
