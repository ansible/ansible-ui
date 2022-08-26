import { Fragment, useMemo } from 'react'
import { ITableColumn, ItemView, PageHeader } from '../../../framework'
import { createdColumn, modifiedColumn, nameColumn } from '../../common/columns'
import { deleteItemAction } from '../../common/item-actions'
import { useDeleteToolbarAction } from '../../common/toolbar-actions'
import { getItemKey, useItems } from '../../Data'
import { RouteE } from '../../route'

export interface ICredentialTypes {
    id: number
    type: 'schedule'
    url: string
    name: string
    modified: string
    created: string
}

const breadcrumbs = [{ label: 'Dashboard', to: RouteE.Dashboard }, { label: 'CredentialTypes' }]

export default function CredentialTypesPage() {
    return (
        <Fragment>
            <PageHeader title="CredentialTypes" breadcrumbs={breadcrumbs} />
            <CredentialTypes />
        </Fragment>
    )
}

export function useCredentialTypes() {
    const { items: workflowApprovals, loading } = useItems<ICredentialTypes>('credential_types')
    return { workflowApprovals, loading }
}

export function CredentialTypes() {
    const { workflowApprovals } = useCredentialTypes()
    return <CredentialTypesTable workflowApprovals={workflowApprovals} />
}

export function CredentialTypesTable(props: { workflowApprovals: ICredentialTypes[] }) {
    const { workflowApprovals } = props

    const deleteToolbarAction = useDeleteToolbarAction()
    const toolbarActions = useMemo(() => [deleteToolbarAction], [deleteToolbarAction])

    return (
        <ItemView
            items={workflowApprovals}
            columns={columns}
            itemKeyFn={getItemKey}
            singular="credential type"
            plural="credential types"
            article="a"
            searchKeys={searchKeys}
            toolbarActions={toolbarActions}
            itemActions={itemActions}
        />
    )
}

const columns: ITableColumn<ICredentialTypes>[] = [nameColumn, modifiedColumn, createdColumn]

const searchKeys = [{ name: 'name' }]

const itemActions = [deleteItemAction]
