import { Fragment, Suspense, useMemo } from 'react'
import { useCreatedColumn, useModifiedColumn, useNameColumn } from '../../common/columns'
import { useDeleteItemAction } from '../../common/item-actions'
import { useDeleteToolbarAction } from '../../common/toolbar-actions'
import { getItemKey, IItem, useItems } from '../../Data'
import { ITableColumn, ItemView, LoadingTable, PageHeader } from '../../framework'
import { useTranslation } from '../../framework/components/useTranslation'
import { RouteE } from '../../route'

export interface INotification extends IItem {
    type: 'notification'
    name: string
}

export function useNotifications() {
    const { items: notifications } = useItems<INotification>('notifications')
    return notifications
}

export default function NotificationsPage() {
    const { t } = useTranslation()
    const breadcrumbs = useMemo(() => [{ label: t('Dashboard'), to: RouteE.Dashboard }, { label: t('Notifications') }], [])
    return (
        <Fragment>
            <PageHeader title={t('Notifications')} breadcrumbs={breadcrumbs} noBorderBottom />
            <Notifications />
        </Fragment>
    )
}

export function Notifications() {
    return (
        <Suspense fallback={<LoadingTable toolbar />}>
            <NotificationsInternal />
        </Suspense>
    )
}

export function NotificationsInternal() {
    const notifications = useNotifications()
    return <NotificationsTable notifications={notifications} />
}

export function NotificationsTable(props: { notifications: INotification[] }) {
    const { notifications } = props
    const { t } = useTranslation()

    const searchKeys = useMemo(() => [{ name: 'name' }], [])

    const deleteToolbarAction = useDeleteToolbarAction()
    const toolbarActions = useMemo(() => [deleteToolbarAction], [deleteToolbarAction])

    const nameColumn = useNameColumn()
    const createdColumn = useCreatedColumn()
    const modifiedColumn = useModifiedColumn()
    const columns: ITableColumn<INotification>[] = useMemo(() => {
        const newColumns: ITableColumn<INotification>[] = [nameColumn, createdColumn, modifiedColumn]
        return newColumns
    }, [createdColumn, modifiedColumn, nameColumn])

    const deleteItemAction = useDeleteItemAction()
    const itemActions = useMemo(() => [deleteItemAction], [deleteItemAction])

    return (
        <ItemView
            items={notifications}
            itemKeyFn={getItemKey}
            singular={t('notification')}
            plural={t('notifications')}
            article="a"
            searchKeys={searchKeys}
            toolbarActions={toolbarActions}
            columns={columns}
            itemActions={itemActions}
        />
    )
}
