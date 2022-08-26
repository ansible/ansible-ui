import { Fragment, useMemo } from 'react'
import { ITableColumn, ItemView, PageHeader } from '../../../framework'
import { createdColumn, modifiedColumn, nameColumn } from '../../common/columns'
import { deleteItemAction } from '../../common/item-actions'
import { useDeleteToolbarAction } from '../../common/toolbar-actions'
import { getItemKey, useItems } from '../../Data'
import { RouteE } from '../../route'

export interface IInstanceGroups {
    id: number
    type: 'schedule'
    url: string
    name: string
    modified: string
    created: string
}

const breadcrumbs = [{ label: 'Dashboard', to: RouteE.Dashboard }, { label: 'InstanceGroups' }]

export default function InstanceGroupsPage() {
    return (
        <Fragment>
            <PageHeader title="InstanceGroups" breadcrumbs={breadcrumbs} />
            <InstanceGroups />
        </Fragment>
    )
}

export function useInstanceGroups() {
    const { items: workflowApprovals, loading } = useItems<IInstanceGroups>('instance_groups')
    return { workflowApprovals, loading }
}

export function InstanceGroups() {
    const { workflowApprovals } = useInstanceGroups()
    return <InstanceGroupsTable workflowApprovals={workflowApprovals} />
}

export function InstanceGroupsTable(props: { workflowApprovals: IInstanceGroups[] }) {
    const { workflowApprovals } = props

    const deleteToolbarAction = useDeleteToolbarAction()
    const toolbarActions = useMemo(() => [deleteToolbarAction], [deleteToolbarAction])

    return (
        <ItemView
            items={workflowApprovals}
            columns={columns}
            itemKeyFn={getItemKey}
            singular="instance group"
            plural="instance groups"
            article="a"
            searchKeys={searchKeys}
            toolbarActions={toolbarActions}
            itemActions={itemActions}
        />
    )
}

const columns: ITableColumn<IInstanceGroups>[] = [nameColumn, modifiedColumn, createdColumn]

const searchKeys = [{ name: 'name' }]

const itemActions = [deleteItemAction]
