import { Fragment, useMemo } from 'react'
import { ITableColumn, ItemView, PageHeader } from '../../../framework'
import { createdColumn, modifiedColumn, nameColumn } from '../../common/columns'
import { deleteItemAction } from '../../common/item-actions'
import { useDeleteToolbarAction } from '../../common/toolbar-actions'
import { getItemKey, useItems } from '../../Data'
import { RouteE } from '../../route'

export interface IManagementJobs {
    id: number
    type: 'schedule'
    url: string
    name: string
    modified: string
    created: string
}

const breadcrumbs = [{ label: 'Dashboard', to: RouteE.Dashboard }, { label: 'ManagementJobs' }]

export default function ManagementJobsPage() {
    return (
        <Fragment>
            <PageHeader title="ManagementJobs" breadcrumbs={breadcrumbs} />
            <ManagementJobs />
        </Fragment>
    )
}

export function useManagementJobs() {
    const { items: workflowApprovals, loading } = useItems<IManagementJobs>('system_job_templates')
    return { workflowApprovals, loading }
}

export function ManagementJobs() {
    const { workflowApprovals } = useManagementJobs()
    return <ManagementJobsTable workflowApprovals={workflowApprovals} />
}

export function ManagementJobsTable(props: { workflowApprovals: IManagementJobs[] }) {
    const { workflowApprovals } = props

    const deleteToolbarAction = useDeleteToolbarAction()
    const toolbarActions = useMemo(() => [deleteToolbarAction], [deleteToolbarAction])

    return (
        <ItemView
            items={workflowApprovals}
            columns={columns}
            itemKeyFn={getItemKey}
            singular="management job"
            plural="management jobs"
            article="a"
            searchKeys={searchKeys}
            toolbarActions={toolbarActions}
            itemActions={itemActions}
        />
    )
}

const columns: ITableColumn<IManagementJobs>[] = [nameColumn, modifiedColumn, createdColumn]

const searchKeys = [{ name: 'name' }]

const itemActions = [deleteItemAction]
