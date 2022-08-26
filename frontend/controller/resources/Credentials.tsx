import { Fragment, Suspense, useMemo } from 'react'
import { ITableColumn, ItemView, LoadingTable, PageHeader } from '../../../framework'
import { useTranslation } from '../../../framework/components/useTranslation'
import { useCreatedColumn, useModifiedColumn, useNameColumn, useOrganizationNameColumn } from '../../common/columns'
import { useCopyItemAction, useDeleteItemAction, useEditItemAction } from '../../common/item-actions'
import { useCreateToolbarAction, useDeleteToolbarAction } from '../../common/toolbar-actions'
import { getItemKey, IItem, useItems } from '../../Data'
import { RouteE } from '../../route'

export interface ICredentials extends IItem {
    type: 'credential'
    name: string
    organization: number
}

export function useCredentials() {
    const { items: credentials } = useItems<ICredentials>('credentials')
    return credentials
}

export default function CredentialsPage() {
    const { t } = useTranslation()
    const breadcrumbs = useMemo(() => [{ label: t('Dashboard'), to: RouteE.Dashboard }, { label: t('Credentials') }], [t])
    return (
        <Fragment>
            <PageHeader title={t('Credentials')} breadcrumbs={breadcrumbs} />
            <Suspense fallback={<LoadingTable toolbar />}>
                <Credentials />
            </Suspense>
        </Fragment>
    )
}

export function Credentials() {
    const credentials = useCredentials()
    return <CredentialsTable credentials={credentials} />
}

export function CredentialsTable(props: { credentials: ICredentials[] }) {
    const { credentials } = props
    const { t } = useTranslation()

    const searchKeys = useMemo(() => [{ name: 'name' }], [])

    const createToolbarAction = useCreateToolbarAction()
    const deleteToolbarAction = useDeleteToolbarAction()
    const toolbarActions = useMemo(() => [createToolbarAction, deleteToolbarAction], [createToolbarAction, deleteToolbarAction])

    const nameColumn = useNameColumn()
    const organizationColumn = useOrganizationNameColumn()
    const createdColumn = useCreatedColumn()
    const modifiedColumn = useModifiedColumn()
    const columns: ITableColumn<ICredentials>[] = useMemo(() => {
        const newColumns: ITableColumn<ICredentials>[] = [nameColumn, organizationColumn, createdColumn, modifiedColumn]
        return newColumns
    }, [createdColumn, modifiedColumn, nameColumn, organizationColumn])

    const editItemAction = useEditItemAction()
    const copyItemAction = useCopyItemAction()
    const deleteItemAction = useDeleteItemAction()
    const itemActions = useMemo(
        () => [editItemAction, copyItemAction, deleteItemAction],
        [copyItemAction, deleteItemAction, editItemAction]
    )

    return (
        <ItemView
            items={credentials}
            itemKeyFn={getItemKey}
            singular={t('credential')}
            plural={t('credentials')}
            article="a"
            searchKeys={searchKeys}
            toolbarActions={toolbarActions}
            columns={columns}
            itemActions={itemActions}
        />
    )
}
