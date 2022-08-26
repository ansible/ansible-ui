import { Fragment, useMemo } from 'react'
import { ITableColumn, ItemView, PageHeader } from '../../../framework'
import { createdColumn, modifiedColumn, nameColumn } from '../../common/columns'
import { deleteItemAction } from '../../common/item-actions'
import { useDeleteToolbarAction } from '../../common/toolbar-actions'
import { getItemKey, useItems } from '../../Data'
import { RouteE } from '../../route'

export interface IInstances {
    id: number
    type: 'schedule'
    url: string
    name: string
    modified: string
    created: string
}

const breadcrumbs = [{ label: 'Dashboard', to: RouteE.Dashboard }, { label: 'Instances' }]

export default function InstancesPage() {
    return (
        <Fragment>
            <PageHeader title="Instances" breadcrumbs={breadcrumbs} />
            <Instances />
        </Fragment>
    )
}

export function useInstances() {
    const { items: workflowApprovals, loading } = useItems<IInstances>('instances')
    return { workflowApprovals, loading }
}

export function Instances() {
    const { workflowApprovals } = useInstances()
    return <InstancesTable workflowApprovals={workflowApprovals} />
}

export function InstancesTable(props: { workflowApprovals: IInstances[] }) {
    const { workflowApprovals } = props

    const deleteToolbarAction = useDeleteToolbarAction()
    const toolbarActions = useMemo(() => [deleteToolbarAction], [deleteToolbarAction])

    return (
        <ItemView
            items={workflowApprovals}
            columns={columns}
            itemKeyFn={getItemKey}
            singular="instance"
            plural="instances"
            article="a"
            searchKeys={searchKeys}
            toolbarActions={toolbarActions}
            itemActions={itemActions}
        />
    )
}

const columns: ITableColumn<IInstances>[] = [nameColumn, modifiedColumn, createdColumn]

const searchKeys = [{ name: 'name' }]

const itemActions = [deleteItemAction]
