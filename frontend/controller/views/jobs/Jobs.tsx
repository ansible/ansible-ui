/* eslint-disable i18next/no-literal-string */
import {
  ITableColumn,
  ITypedAction,
  TablePage,
  TextCell,
  TypedActionType,
} from '../../../../framework'
import { StatusCell } from '../../../common/StatusCell'
import { TrashIcon } from '@patternfly/react-icons'
import { useMemo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { UnifiedJob } from '../../interfaces/UnifiedJob'
import { useControllerView } from '../../useControllerView'
import { useNameColumn } from '../../../common/columns'
import { formatDateString } from '../../../common/dates'
import { useNavigate } from 'react-router-dom'
import { useDeleteJobs } from './useDeleteJobs'
import { RouteE } from '../../../Routes'

export default function Jobs() {
  const { t } = useTranslation()
  const tableColumns = useJobsColumns({ displayIdWithName: true })
  const view = useControllerView<UnifiedJob>({
    url: '/api/v2/unified_jobs/',
    tableColumns,
  })

  const deleteJobs = useDeleteJobs((jobs: UnifiedJob[]) => {
    view.unselectItems(jobs)
    void view.refresh()
  })

  const toolbarActions = useMemo<ITypedAction<UnifiedJob>[]>(
    () => [
      {
        type: TypedActionType.bulk,
        icon: TrashIcon,
        label: t('Delete selected jobs'),
        onClick: deleteJobs,
      },
    ],
    [deleteJobs, t]
  )

  const rowActions = useMemo<ITypedAction<UnifiedJob>[]>(
    () => [
      {
        type: TypedActionType.single,
        icon: TrashIcon,
        label: t(`Delete job`),
        onClick: (job: UnifiedJob) => deleteJobs([job]),
      },
    ],
    [deleteJobs, t]
  )

  return (
    <TablePage
      title={t('Jobs')}
      titleHelpTitle={t('Jobs')}
      titleHelp={t('jobs.title.help')}
      titleDocLink="https://docs.ansible.com/ansible-tower/latest/html/userguide/jobs.html"
      description={t('jobs.title.description')}
      tableColumns={tableColumns}
      toolbarActions={toolbarActions}
      rowActions={rowActions}
      errorStateTitle={t('Error loading jobs')}
      emptyStateTitle={t('No jobs yet')}
      emptyStateDescription={t('Please run a job to populate this list.')}
      {...view}
    />
  )
}

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
  const nameColumn = useNameColumn({ header: t('Job'), ...options, onClick: nameColumnClick })
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
        header: t('Start Time'),
        cell: (job: UnifiedJob) => <TextCell text={formatDateString(job.started)} />,
        sort: 'started',
      },
      {
        header: t('Finish Time'),
        cell: (job: UnifiedJob) => <TextCell text={formatDateString(job.finished)} />,
        sort: 'finished',
      },
    ],
    [t, nameColumn]
  )
  return tableColumns
}
