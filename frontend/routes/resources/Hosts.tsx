import { Fragment, Suspense, useMemo } from 'react'
import { ITableColumn, ItemView, LoadingTable, PageHeader } from '../../framework'
import { useTranslation } from '../../framework/components/useTranslation'
import { useCreatedColumn, useEnabledColumn, useModifiedColumn, useNameColumn } from '../../common/columns'
import { useDeleteItemAction } from '../../common/item-actions'
import { useEnabledFilter } from '../../common/item-filters'
import { useDeleteToolbarAction } from '../../common/toolbar-actions'
import { getItemKey, IItem, useItems } from '../../Data'
import { RouteE } from '../../route'

export interface IHost extends IItem {
    type: 'host'
    name: string
    enabled: boolean
}

export function useHosts() {
    const { items: hosts } = useItems<IHost>('hosts')
    return hosts
}

export default function HostsPage() {
    const { t } = useTranslation()
    const breadcrumbs = [{ label: t('Dashboard'), to: RouteE.Dashboard }, { label: t('Hosts') }]
    return (
        <Fragment>
            <PageHeader title={t('Hosts')} breadcrumbs={breadcrumbs} noBorderBottom />
            <Suspense fallback={<LoadingTable toolbar />}>
                <Hosts />
            </Suspense>
        </Fragment>
    )
}

export function Hosts() {
    const hosts = useHosts()
    return <HostsTable hosts={hosts} />
}

export function HostsTable(props: { hosts: IHost[] }) {
    const { t } = useTranslation()
    const { hosts } = props

    const searchKeys = useMemo(() => [{ name: 'name' }], [])

    const enabledFilter = useEnabledFilter()
    const filters = [enabledFilter]

    const deleteToolbarAction = useDeleteToolbarAction()
    const toolbarActions = useMemo(() => [deleteToolbarAction], [deleteToolbarAction])

    const nameColumn = useNameColumn()
    const enabledColumn = useEnabledColumn()
    const createdColumn = useCreatedColumn()
    const modifiedColumn = useModifiedColumn()
    const columns: ITableColumn<IHost>[] = useMemo(() => {
        const newColumns: ITableColumn<IHost>[] = [nameColumn, enabledColumn, createdColumn, modifiedColumn]
        return newColumns
    }, [createdColumn, enabledColumn, modifiedColumn, nameColumn])

    const deleteItemAction = useDeleteItemAction()
    const itemActions = useMemo(() => [deleteItemAction], [deleteItemAction])

    return (
        <ItemView
            items={hosts}
            columns={columns}
            itemKeyFn={getItemKey}
            singular={t('host')}
            plural={t('hosts')}
            article="a"
            searchKeys={searchKeys}
            toolbarActions={toolbarActions}
            itemActions={itemActions}
            filters={filters}
        />
    )
}
