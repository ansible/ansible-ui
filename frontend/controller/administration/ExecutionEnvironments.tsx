import { Fragment, useMemo } from 'react'
import { ITableColumn, ItemView, PageHeader } from '../../../framework'
import { createdColumn, modifiedColumn, nameColumn } from '../../common/columns'
import { deleteItemAction } from '../../common/item-actions'
import { useDeleteToolbarAction } from '../../common/toolbar-actions'
import { getItemKey, useItems } from '../../Data'
import { RouteE } from '../../route'

export interface IExecutionEnvironments {
    id: number
    type: 'schedule'
    url: string
    name: string
    modified: string
    created: string
}

const breadcrumbs = [{ label: 'Dashboard', to: RouteE.Dashboard }, { label: 'ExecutionEnvironments' }]

export default function ExecutionEnvironmentsPage() {
    return (
        <Fragment>
            <PageHeader title="ExecutionEnvironments" breadcrumbs={breadcrumbs} />
            <ExecutionEnvironments />
        </Fragment>
    )
}

export function useExecutionEnvironments() {
    const { items: workflowApprovals, loading } = useItems<IExecutionEnvironments>('execution_environments')
    return { workflowApprovals, loading }
}

export function ExecutionEnvironments() {
    const { workflowApprovals } = useExecutionEnvironments()
    return <ExecutionEnvironmentsTable workflowApprovals={workflowApprovals} />
}

export function ExecutionEnvironmentsTable(props: { workflowApprovals: IExecutionEnvironments[] }) {
    const { workflowApprovals } = props

    const deleteToolbarAction = useDeleteToolbarAction()
    const toolbarActions = useMemo(() => [deleteToolbarAction], [deleteToolbarAction])

    return (
        <ItemView
            items={workflowApprovals}
            columns={columns}
            itemKeyFn={getItemKey}
            singular="execution environment"
            plural="execution environments"
            article="a"
            searchKeys={searchKeys}
            toolbarActions={toolbarActions}
            itemActions={itemActions}
        />
    )
}

const columns: ITableColumn<IExecutionEnvironments>[] = [nameColumn, modifiedColumn, createdColumn]

const searchKeys = [{ name: 'name' }]

const itemActions = [deleteItemAction]
