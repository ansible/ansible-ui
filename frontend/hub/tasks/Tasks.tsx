import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { ITableColumn, IToolbarFilter, SinceCell, TablePage, TextCell } from '../../../framework'
import { useInMemoryView } from '../../../framework/useInMemoryView'
import { StatusCell } from '../../common/StatusCell'
import { useGet } from '../../common/useItem'
import { RouteE } from '../../Routes'
import { pulpHRefKeyFn } from '../useHubView'
import { getIdFromPulpHref } from '../usePulpView'
import { Task } from './Task'

export function Tasks() {
  const { t } = useTranslation()
  const toolbarFilters = useTaskFilters()
  const tableColumns = useTasksColumns()
  const tasksResult = useGet<{ results: Task[] }>('/api/automation-hub/pulp/api/v3/tasks/')
  const view = useInMemoryView<Task>({
    items: tasksResult?.results,
    keyFn: pulpHRefKeyFn,
    tableColumns,
    toolbarFilters,
  })
  // const view = usePulpView<Task>(
  //   '/api/automation-hub/pulp/api/v3/tasks/',
  //   pulpHRefKeyFn,
  //   toolbarFilters,
  //   tableColumns
  // )
  return (
    <>
      <TablePage<Task>
        title={t('Tasks')}
        toolbarFilters={toolbarFilters}
        tableColumns={tableColumns}
        errorStateTitle={t('Error loading tasks')}
        emptyStateTitle={t('No tasks yet')}
        {...view}
      />
    </>
  )
}

export function useTasksColumns(_options?: { disableSort?: boolean; disableLinks?: boolean }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const tableColumns = useMemo<ITableColumn<Task>[]>(
    () => [
      {
        header: t('Name'),
        cell: (task) => (
          <TextCell
            text={task.name}
            onClick={() =>
              navigate(RouteE.TaskDetails.replace(':id', getIdFromPulpHref(task.pulp_href)))
            }
          />
        ),
        sort: 'name',
      },
      {
        header: t('Status'),
        cell: (task) => <StatusCell status={task.state} />,
        sort: 'state',
        hideLabel: true,
      },
      {
        header: t('Started'),
        cell: (task) => <SinceCell value={task.started_at} />,
        sort: 'started_at',
        list: 'secondary',
      },
      {
        header: t('Finished'),
        cell: (task) => <SinceCell value={task.finished_at} />,
        sort: 'finished_at',
        list: 'secondary',
      },
      {
        header: t('Created'),
        cell: (task) => <SinceCell value={task.pulp_created} />,
        sort: 'pulp_created',
        card: 'hidden',
      },
    ],
    [navigate, t]
  )
  return tableColumns
}

export function useTaskFilters() {
  const { t } = useTranslation()
  const toolbarFilters = useMemo<IToolbarFilter[]>(
    () => [
      { key: 'name', label: t('Task name'), type: 'string', query: 'name__contains' },
      { key: 'status', label: t('Status'), type: 'string', query: 'state' },
    ],
    [t]
  )
  return toolbarFilters
}
