import { Fragment, Suspense, useMemo } from 'react'
import { useCreatedColumn, useModifiedColumn, useNameColumn } from '../../common/columns'
import { useDeleteItemAction } from '../../common/item-actions'
import { useDeleteToolbarAction } from '../../common/toolbar-actions'
import { getItemKey, IItem, useItems } from '../../Data'
import { ITableColumn, ItemView, LoadingTable, PageHeader } from '../../framework'
import { useTranslation } from '../../framework/components/useTranslation'
import { RouteE } from '../../route'

export interface IWorkflowApprovals extends IItem {
    type: 'template'
    name: string
    inventory_sources_with_failures: number
}

export function useWorkflowApprovals() {
    const { items: workflowApprovals } = useItems<IWorkflowApprovals>('workflow_approvals')
    return workflowApprovals
}

export default function WorkflowApprovalsPage() {
    const { t } = useTranslation()
    const breadcrumbs = useMemo(() => [{ label: t('Dashboard'), to: RouteE.Dashboard }, { label: t('WorkflowApprovals') }], [t])
    return (
        <Fragment>
            <PageHeader title={t('WorkflowApprovals')} breadcrumbs={breadcrumbs} />
            <Suspense fallback={<LoadingTable toolbar />}>
                <WorkflowApprovals />
            </Suspense>
        </Fragment>
    )
}

export function WorkflowApprovals() {
    const workflowApprovals = useWorkflowApprovals()
    return <WorkflowApprovalsTable workflowApprovals={workflowApprovals} />
}

export function WorkflowApprovalsTable(props: { workflowApprovals: IWorkflowApprovals[] }) {
    const { workflowApprovals } = props
    const { t } = useTranslation()

    const searchKeys = useMemo(() => [{ name: 'name' }], [])

    const deleteToolbarAction = useDeleteToolbarAction()
    const toolbarActions = useMemo(() => [deleteToolbarAction], [deleteToolbarAction])

    const nameColumn = useNameColumn()
    const createdColumn = useCreatedColumn()
    const modifiedColumn = useModifiedColumn()
    const columns: ITableColumn<IWorkflowApprovals>[] = useMemo(() => {
        const newColumns: ITableColumn<IWorkflowApprovals>[] = [nameColumn, createdColumn, modifiedColumn]
        return newColumns
    }, [createdColumn, modifiedColumn, nameColumn])

    const deleteItemAction = useDeleteItemAction()
    const itemActions = useMemo(() => [deleteItemAction], [deleteItemAction])

    return (
        <ItemView
            items={workflowApprovals}
            itemKeyFn={getItemKey}
            singular={t('workflow approval')}
            plural={t('workflow approvals')}
            article="a"
            searchKeys={searchKeys}
            toolbarActions={toolbarActions}
            columns={columns}
            itemActions={itemActions}
        />
    )
}
