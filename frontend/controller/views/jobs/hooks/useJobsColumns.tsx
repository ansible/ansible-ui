import { ITableColumn, TextCell, SinceCell } from '../../../../../framework'
import { StatusCell } from '../../../../common/StatusCell'
import { useNameColumn } from '../../../../common/columns'
import { useNavigate } from 'react-router-dom'
import { useMemo, useCallback } from 'react'
import { RouteE } from '../../../../Routes'
import { useTranslation } from 'react-i18next'
import { UnifiedJob } from '../../../interfaces/UnifiedJob'

export function useJobsColumns(options?: {
  disableSort?: boolean
  disableLinks?: boolean
  displayIdWithName?: boolean
}) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const nameColumnClick = useCallback(
    (job: UnifiedJob) => navigate(RouteE.JobDetails.replace(':id', job.id.toString())),
    [navigate]
  )
  const nameColumn = useNameColumn({ header: t('Name'), ...options, onClick: nameColumnClick })
  const tableColumns = useMemo<ITableColumn<UnifiedJob>[]>(
    () => [
      nameColumn,
      {
        header: t('Status'),
        cell: (job: UnifiedJob) => <StatusCell status={job.status} />,
        sort: 'status',
      },
      {
        header: t('Type'),
        cell: (job: UnifiedJob) => {
          const jobTypes: { [key: string]: string } = {
            project_update: t`Source Control Update`,
            inventory_update: t`Inventory Sync`,
            job: job.job_type === 'check' ? t`Playbook Check` : t`Playbook Run`,
            ad_hoc_command: t`Command`,
            system_job: t`Management Job`,
            workflow_job: t`Workflow Job`,
          }
          return <TextCell text={jobTypes[job.type]} />
        },
        sort: 'type',
      },
      {
        header: t('Started'),
        cell: (job: UnifiedJob) => <SinceCell value={job.started} />,
        sort: 'started',
      },
      {
        header: t('Finished'),
        cell: (job: UnifiedJob) => <SinceCell value={job.finished} />,
        sort: 'finished',
      },
    ],
    [t, nameColumn]
  )
  return tableColumns
}
