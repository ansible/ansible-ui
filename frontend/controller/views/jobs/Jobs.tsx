/* eslint-disable i18next/no-literal-string */
import {
  ITableColumn,
  ITypedAction,
  IToolbarFilter,
  TablePage,
  TextCell,
  TypedActionType,
  SinceCell,
} from '../../../../framework'
import { StatusCell } from '../../../common/StatusCell'
import { useNameToolbarFilter } from '../../common/controller-toolbar-filters'
import { BanIcon, TrashIcon } from '@patternfly/react-icons'
import { useMemo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { UnifiedJob } from '../../interfaces/UnifiedJob'
import { useControllerView } from '../../useControllerView'
import { useNameColumn } from '../../../common/columns'
import { useNavigate } from 'react-router-dom'
import { useDeleteJobs } from './useDeleteJobs'
import { useCancelJobs } from './useCancelJobs'
import { RouteE } from '../../../Routes'

export default function Jobs() {
  const { t } = useTranslation()
  const toolbarFilters = useJobsFilters()
  const tableColumns = useJobsColumns({ displayIdWithName: true })
  const view = useControllerView<UnifiedJob>({
    url: '/api/v2/unified_jobs/',
    toolbarFilters,
    tableColumns,
  })

  const deleteJobs = useDeleteJobs((jobs: UnifiedJob[]) => {
    view.unselectItems(jobs)
    void view.refresh()
  })

  const cancelJobs = useCancelJobs((jobs: UnifiedJob[]) => {
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
      {
        type: TypedActionType.bulk,
        icon: BanIcon,
        label: t('Cancel selected jobs'),
        onClick: cancelJobs,
      },
    ],
    [deleteJobs, cancelJobs, t]
  )

  const rowActions = useMemo<ITypedAction<UnifiedJob>[]>(
    () => [
      {
        type: TypedActionType.single,
        icon: TrashIcon,
        label: t(`Delete job`),
        onClick: (job: UnifiedJob) => deleteJobs([job]),
      },
      {
        type: TypedActionType.single,
        icon: BanIcon,
        label: t(`Cancel job`),
        onClick: (job: UnifiedJob) => cancelJobs([job]),
      },
    ],
    [deleteJobs, cancelJobs, t]
  )

  return (
    <TablePage
      title={t('Jobs')}
      titleHelpTitle={t('Jobs')}
      titleHelp={t('jobs.title.help')}
      titleDocLink="https://docs.ansible.com/ansible-tower/latest/html/userguide/jobs.html"
      description={t('jobs.title.description')}
      toolbarFilters={toolbarFilters}
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

export function useJobsFilters() {
  const { t } = useTranslation()
  const nameToolbarFilter = useNameToolbarFilter()
  const toolbarFilters = useMemo<IToolbarFilter[]>(
    () => [
      nameToolbarFilter,
      {
        key: 'id',
        label: t('ID'),
        type: 'string',
        query: 'id',
      },
      {
        key: 'labels__name__icontains',
        label: t('Label Name'),
        type: 'string',
        query: 'labels__name__icontains',
      },
      {
        key: 'type',
        label: t('Job Type'),
        type: 'select',
        query: 'type',
        options: [
          { label: t('Source Control Update'), value: 'project_update' },
          { label: t('Inventory Sync'), value: 'inventory_update' },
          { label: t('Playbook Run'), value: 'job' },
          { label: t('Command'), value: 'ad_hoc_command' },
          { label: t('Management Job'), value: 'system_job' },
          { label: t('Workflow Job'), value: 'workflow_job' },
        ],
        placeholder: t('Filter By Job Type'),
      },
      {
        key: 'created_by__username__icontains',
        label: t('Launched By (Username)'),
        type: 'string',
        query: 'created_by__username__icontains',
      },
      {
        key: 'status',
        label: t('Status'),
        type: 'select',
        query: 'status',
        options: [
          { label: t('New'), value: 'new' },
          { label: t('Pending'), value: 'pending' },
          { label: t('Waiting'), value: 'waiting' },
          { label: t('Running'), value: 'running' },
          { label: t('Successful'), value: 'successful' },
          { label: t('Failed'), value: 'failed' },
          { label: t('Error'), value: 'error' },
          { label: t('Canceled'), value: 'canceled' },
        ],
        placeholder: t('Filter By Status'),
      },
      {
        key: 'job__limit',
        label: t('Limit'),
        type: 'string',
        query: 'job__limit',
      },
    ],
    [nameToolbarFilter, t]
  )
  return toolbarFilters
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
