import { Fragment, Suspense, useMemo } from 'react'
import { ITableColumn, ItemView, LoadingTable, PageHeader } from '../../../framework'
import { useTranslation } from '../../../framework/components/useTranslation'
import { useCreatedColumn, useModifiedColumn, useNameColumn } from '../../common/columns'
import { useDeleteItemAction } from '../../common/item-actions'
import { useDeleteToolbarAction } from '../../common/toolbar-actions'
import { getItemKey, IItem, useItems } from '../../Data'
import { RouteE } from '../../route'

export interface ISchedule extends IItem {
    type: 'schedule'
    name: string
}

export function useSchedules() {
    const { items: schedules } = useItems<ISchedule>('schedules')
    return schedules
}

export default function SchedulesPage() {
    const { t } = useTranslation()
    const breadcrumbs = useMemo(() => [{ label: t('Dashboard'), to: RouteE.Dashboard }, { label: t('Schedules') }], [t])
    return (
        <Fragment>
            <PageHeader title={t('Schedules')} breadcrumbs={breadcrumbs} />
            <Schedules />
        </Fragment>
    )
}

export function Schedules() {
    return (
        <Suspense fallback={<LoadingTable toolbar />}>
            <SchedulesInternal />
        </Suspense>
    )
}

export function SchedulesInternal() {
    const schedules = useSchedules()
    return <SchedulesTable schedules={schedules} />
}

export function SchedulesTable(props: { schedules: ISchedule[] }) {
    const { schedules } = props
    const { t } = useTranslation()

    const searchKeys = useMemo(() => [{ name: 'name' }], [])

    const deleteToolbarAction = useDeleteToolbarAction()
    const toolbarActions = useMemo(() => [deleteToolbarAction], [deleteToolbarAction])

    const nameColumn = useNameColumn()
    const createdColumn = useCreatedColumn()
    const modifiedColumn = useModifiedColumn()
    const columns: ITableColumn<ISchedule>[] = useMemo(() => {
        const newColumns: ITableColumn<ISchedule>[] = [nameColumn, createdColumn, modifiedColumn]
        return newColumns
    }, [createdColumn, modifiedColumn, nameColumn])

    const deleteItemAction = useDeleteItemAction()
    const itemActions = useMemo(() => [deleteItemAction], [deleteItemAction])

    return (
        <ItemView
            items={schedules}
            itemKeyFn={getItemKey}
            singular={t('schedule')}
            plural={t('schedules')}
            article="a"
            searchKeys={searchKeys}
            toolbarActions={toolbarActions}
            columns={columns}
            itemActions={itemActions}
        />
    )
}
