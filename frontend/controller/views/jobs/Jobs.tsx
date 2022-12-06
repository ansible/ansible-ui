import { TablePage } from '../../../../framework'

import { useTranslation } from 'react-i18next'
import { UnifiedJob } from '../../interfaces/UnifiedJob'
import { useControllerView } from '../../useControllerView'
import { useJobsColumns } from './hooks/useJobsColumns'
import { useJobsFilters } from './hooks/useJobsFilters'
import { useJobToolbarActions } from './hooks/useJobToolbarActions'
import { useJobRowActions } from './hooks/useJobRowActions'

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
  const toolbarActions = useJobToolbarActions(view.unselectItemsAndRefresh)
  const rowActions = useJobRowActions(view.unselectItemsAndRefresh)

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
