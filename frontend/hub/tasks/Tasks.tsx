import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ITableColumn, IToolbarFilter, PageBody, PageHeader, PageLayout, PageTable, SinceCell, TextCell } from '../../../framework'
import { StatusCell } from '../../common/StatusCell'
import { pulpHRefKeyFn } from '../useHubView'
import { usePulpView } from '../usePulpView'
import { Task } from './Task'

export function Tasks() {
    const { t } = useTranslation()
    const toolbarFilters = useTaskFilters()
    const tableColumns = useTasksColumns()
    const view = usePulpView<Task>('/api/automation-hub/pulp/api/v3/tasks/', pulpHRefKeyFn, toolbarFilters, tableColumns)
    return (
        <PageLayout>
            <PageHeader title={t('Tasks')} />
            <PageBody>
                <PageTable<Task>
                    toolbarFilters={toolbarFilters}
                    tableColumns={tableColumns}
                    errorStateTitle={t('Error loading tasks')}
                    emptyStateTitle={t('No tasks yet')}
                    {...view}
                />
            </PageBody>
        </PageLayout>
    )
}

export function useTasksColumns(_options?: { disableSort?: boolean; disableLinks?: boolean }) {
    const { t } = useTranslation()
    const tableColumns = useMemo<ITableColumn<Task>[]>(
        () => [
            { header: t('Name'), cell: (task) => <TextCell text={task.name} />, sort: 'name' },
            { header: t('Created'), cell: (task) => <SinceCell value={task.pulp_created} />, sort: 'pulp_created' },
            { header: t('Started'), cell: (task) => <SinceCell value={task.started_at} />, sort: 'started_at' },
            { header: t('Finished'), cell: (task) => <SinceCell value={task.finished_at} />, sort: 'finished_at' },
            { header: t('Status'), cell: (task) => <StatusCell status={task.state} />, sort: 'state' },
        ],
        [t]
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
