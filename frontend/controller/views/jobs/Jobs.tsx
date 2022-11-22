import { ITypedAction, TablePage, TypedActionType } from '../../../../framework'

import { BanIcon, RocketIcon, TrashIcon } from '@patternfly/react-icons'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { UnifiedJob } from '../../interfaces/UnifiedJob'
import { useControllerView } from '../../useControllerView'
import { useCancelJobs } from './hooks/useCancelJobs'
import { useDeleteJobs } from './hooks/useDeleteJobs'
import { useJobsColumns } from './hooks/useJobsColumns'
import { useJobsFilters } from './hooks/useJobsFilters'
import { isJobRunning } from './jobUtils'
import { ButtonVariant } from '@patternfly/react-core'

export default function Jobs() {
  const { t } = useTranslation()
  const toolbarFilters = useJobsFilters()
  const tableColumns = useJobsColumns()
  const view = useControllerView<UnifiedJob>({
    url: '/api/v2/unified_jobs/',
    queryParams: {
      not__launch_type: 'sync',
    },
    toolbarFilters,
    tableColumns,
  })

  const deleteJobs = useDeleteJobs(view.unselectItemsAndRefresh)

  const cancelJobs = useCancelJobs(view.unselectItemsAndRefresh)

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

  const rowActions = useMemo<ITypedAction<UnifiedJob>[]>(() => {
    const cannotDeleteJob = (job: UnifiedJob) => {
      if (!job.summary_fields.user_capabilities.delete)
        return t(`The job cannot be deleted due to insufficient permission`)
      else if (isJobRunning(job.status))
        return t(`The job cannot be deleted due to a running job status`)
      return ''
    }

    const cannotCancelJob = (job: UnifiedJob) => {
      if (!job.summary_fields.user_capabilities.start && isJobRunning(job.status))
        return t(`The job cannot be canceled due to insufficient permission`)
      else if (!isJobRunning(job.status))
        return t(`The job cannot be canceled because it is not running`)
      return ''
    }

    return [
      {
        type: TypedActionType.single,
        variant: ButtonVariant.secondary,
        icon: RocketIcon,
        label: t(`Relaunch job`),
        isHidden: (job: UnifiedJob) =>
          job.type === 'system_job' || !job.summary_fields?.user_capabilities?.start,
        onClick: (job: UnifiedJob) => {
          // eslint-disable-next-line no-console
          console.log('Clicked job', job)
        },
      },
      {
        type: TypedActionType.single,
        icon: TrashIcon,
        label: t(`Delete job`),
        isDisabled: (job: UnifiedJob) => cannotDeleteJob(job),
        onClick: (job: UnifiedJob) => deleteJobs([job]),
      },
      {
        type: TypedActionType.single,
        icon: BanIcon,
        label: t(`Cancel job`),
        isDisabled: (job: UnifiedJob) => cannotCancelJob(job),
        onClick: (job: UnifiedJob) => cancelJobs([job]),
      },
    ]
  }, [deleteJobs, cancelJobs, t])

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
