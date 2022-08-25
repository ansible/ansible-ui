import { Skeleton } from '@patternfly/react-core'
import { Fragment, Suspense, useMemo } from 'react'
import { useCreatedColumn, useModifiedColumn, useNameColumn, useOrganizationNameColumn } from '../../common/columns'
import { useDeleteItemAction } from '../../common/item-actions'
import { useDeleteToolbarAction } from '../../common/toolbar-actions'
import { getItemKey, IItem, useItem, useItems } from '../../Data'
import { ITableColumn, ItemView, LoadingTable, PageHeader, TextCell } from '../../framework'
import { useTranslation } from '../../framework/components/useTranslation'
import { RouteE } from '../../route'

export interface Inventory extends IItem {
    type: 'inventory'
    name: string
    organization: number
    inventory_sources_with_failures: number
}

export function useInventories() {
    const { items: inventories } = useItems<Inventory>('inventories')
    return inventories
}

export function InventoryName(props: { id?: number }) {
    return (
        <Suspense fallback={<Skeleton width="120px" />}>
            <InventoryNameInternal id={props.id} />
        </Suspense>
    )
}

export function InventoryNameInternal(props: { id?: number }) {
    const inventory = useItem<Inventory>(props.id, 'inventories')
    if (!inventory) return <></>
    return <TextCell text={inventory.name} to={`/inventories/${props.id}`} />
}

export function useInventoryNameColumn() {
    const { t } = useTranslation()
    const column: ITableColumn<{ organization?: number }> = {
        header: t('Inventory'),
        cell: (item) => {
            return <InventoryName id={item.organization} />
        },
        // sortFn: (l, r) => compareStrings(l.modified, r.modified),
    }
    return column
}

export default function InventoriesPage() {
    const { t } = useTranslation()
    const breadcrumbs = useMemo(() => [{ label: t('Dashboard'), to: RouteE.Dashboard }, { label: t('Inventories') }], [t])
    return (
        <Fragment>
            <PageHeader
                title={t('Inventories')}
                breadcrumbs={breadcrumbs}
                noBorderBottom
                titleHelp={t(
                    'Ansible works against multiple managed nodes or “hosts” in your infrastructure at the same time, using a list or group of lists known as inventory. Once your inventory is defined, you use patterns to select the hosts or groups you want Ansible to run against.'
                )}
            />
            <Suspense fallback={<LoadingTable toolbar />}>
                <Inventories />
            </Suspense>
        </Fragment>
    )
}

export function Inventories() {
    const inventories = useInventories()
    return <InventoriesTable inventories={inventories} />
}

export function InventoriesTable(props: { inventories: Inventory[] }) {
    const { inventories } = props
    const { t } = useTranslation()

    const searchKeys = useMemo(() => [{ name: 'name' }], [])

    const deleteToolbarAction = useDeleteToolbarAction()
    const toolbarActions = useMemo(() => [deleteToolbarAction], [deleteToolbarAction])

    const nameColumn = useNameColumn()
    const organizationColumn = useOrganizationNameColumn()
    const createdColumn = useCreatedColumn()
    const modifiedColumn = useModifiedColumn()
    const columns: ITableColumn<Inventory>[] = useMemo(() => {
        const newColumns: ITableColumn<Inventory>[] = [nameColumn, organizationColumn, createdColumn, modifiedColumn]
        return newColumns
    }, [createdColumn, modifiedColumn, nameColumn, organizationColumn])

    const deleteItemAction = useDeleteItemAction()
    const itemActions = useMemo(() => [deleteItemAction], [deleteItemAction])

    return (
        <ItemView
            items={inventories}
            itemKeyFn={getItemKey}
            singular={t('inventory')}
            plural={t('inventories')}
            article="a"
            searchKeys={searchKeys}
            toolbarActions={toolbarActions}
            columns={columns}
            itemActions={itemActions}
        />
    )
}
