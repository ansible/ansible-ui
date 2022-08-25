import { useMemo } from 'react'
import { IItemAction, ITableColumn, IToolbarAction, TextCell } from '../../../../framework'
import { useTranslation } from '../../../../framework/components/useTranslation'
import { IToolbarFilter } from '../../../../framework/PageToolbar'
import { TablePage } from '../../../../framework/TablePage'
import { useCreatedColumn, useModifiedColumn } from '../../../common/columns'
import { compareStrings } from '../../../common/compare'
import {
    useCreatedByToolbarFilter,
    useModifiedByToolbarFilter,
    useNameToolbarFilter,
    useOrganizationToolbarFilter,
} from '../../../common/controller-toolbar-filters'
import { useDeleteItemAction, useEditItemAction } from '../../../common/item-actions'
import { useCreateToolbarAction, useDeleteToolbarAction } from '../../../common/toolbar-actions'
import { useControllerView } from '../../../common/useControllerView'
import { getItemKey } from '../../../Data'
import { RouteE } from '../../../route'
import { User } from './User'

export default function Users() {
    const { t } = useTranslation()
    const view = useControllerView<User>('/api/v2/users/', getItemKey)

    // Toolbar Filters
    const nameToolbarFilter = useNameToolbarFilter()
    const organizationToolbarFilter = useOrganizationToolbarFilter()
    const createdByToolbarFilter = useCreatedByToolbarFilter()
    const modifiedByToolbarFilter = useModifiedByToolbarFilter()
    const toolbarFilters = useMemo<IToolbarFilter[]>(
        () => [nameToolbarFilter, organizationToolbarFilter, createdByToolbarFilter, modifiedByToolbarFilter],
        [nameToolbarFilter, organizationToolbarFilter, createdByToolbarFilter, modifiedByToolbarFilter]
    )

    // Toolbar Actions
    const createToolbarAction = useCreateToolbarAction(RouteE.CreateUser)
    const deleteToolbarAction = useDeleteToolbarAction()
    const toolbarActions = useMemo<IToolbarAction<User>[]>(
        () => [createToolbarAction, deleteToolbarAction],
        [createToolbarAction, deleteToolbarAction]
    )

    // Table Columns
    const createdColumn = useCreatedColumn()
    const modifiedColumn = useModifiedColumn()
    const tableColumns = useMemo<ITableColumn<User>[]>(
        () => [
            {
                header: t('Username'),
                cell: (user) => <TextCell text={user.username} to={RouteE.UserDetails.replace(':id', user.id.toString())} />,
                sortFn: (l, r) => compareStrings(l.username, r.username),
            },
            {
                header: t('First Name'),
                cell: (user) => <TextCell text={user.first_name} />,
                sortFn: (l, r) => compareStrings(l.first_name, r.first_name),
            },
            {
                header: t('Last Name'),
                cell: (user) => <TextCell text={user.last_name} />,
                sortFn: (l, r) => compareStrings(l.last_name, r.last_name),
            },
            createdColumn,
            modifiedColumn,
        ],
        [createdColumn, modifiedColumn, t]
    )

    // Row Actions
    const editItemAction = useEditItemAction()
    const deleteItemAction = useDeleteItemAction()
    const rowActions = useMemo<IItemAction<User>[]>(() => [editItemAction, deleteItemAction], [deleteItemAction, editItemAction])

    return (
        <TablePage
            breadcrumbs={[{ label: t('Dashboard'), to: RouteE.Dashboard }, { label: t('Users') }]}
            title={t('Users')}
            titleHelpTitle={t('User')}
            description={t('A user is someone who has access to Tower with associated permissions and credentials.')}
            toolbarFilters={toolbarFilters}
            toolbarActions={toolbarActions}
            tableColumns={tableColumns}
            rowActions={rowActions}
            {...view}
        />
    )
}
