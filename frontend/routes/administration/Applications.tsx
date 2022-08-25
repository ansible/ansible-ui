import { Fragment, useMemo } from 'react'
import { createdColumn, modifiedColumn, nameColumn } from '../../common/columns'
import { deleteItemAction } from '../../common/item-actions'
import { useDeleteToolbarAction } from '../../common/toolbar-actions'
import { getItemKey, useItems } from '../../Data'
import { ITableColumn, ItemView, PageHeader } from '../../framework'
import { RouteE } from '../../route'

export interface IAppications {
    id: number
    type: 'schedule'
    url: string
    name: string
    modified: string
    created: string
}

const breadcrumbs = [{ label: 'Dashboard', to: RouteE.Dashboard }, { label: 'Appications' }]

export default function ApplicationsPage() {
    return (
        <Fragment>
            <PageHeader title="Appications" breadcrumbs={breadcrumbs} noBorderBottom />
            <Appications />
        </Fragment>
    )
}

export function useAppications() {
    const { items: applications, loading } = useItems<IAppications>('applications')
    return { applications, loading }
}

export function Appications() {
    const { applications } = useAppications()
    return <AppicationsTable applications={applications} />
}

export function AppicationsTable(props: { applications: IAppications[] }) {
    const { applications: workflowApprovals } = props

    const deleteToolbarAction = useDeleteToolbarAction()
    const toolbarActions = useMemo(() => [deleteToolbarAction], [deleteToolbarAction])

    return (
        <ItemView
            items={workflowApprovals}
            columns={columns}
            itemKeyFn={getItemKey}
            singular="application"
            plural="applications"
            article="a"
            searchKeys={searchKeys}
            toolbarActions={toolbarActions}
            itemActions={itemActions}
        />
    )
}

const columns: ITableColumn<IAppications>[] = [nameColumn, modifiedColumn, createdColumn]

const searchKeys = [{ name: 'name' }]

const itemActions = [deleteItemAction]
