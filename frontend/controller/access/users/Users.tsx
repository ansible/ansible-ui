import { useMemo } from 'react'
import { IItemAction, ITableColumn, IToolbarAction, IToolbarFilter, TablePage, TextCell } from '../../../../framework'
import { useTranslation } from '../../../../framework/components/useTranslation'
import { useCreatedColumn, useModifiedColumn } from '../../../common/columns'
import {
    useEmailToolbarFilter,
    useFirstNameToolbarFilter,
    useLastNameToolbarFilter,
    useUsernameToolbarFilter,
} from '../../../common/controller-toolbar-filters'
import { useDeleteItemAction, useEditItemAction } from '../../../common/item-actions'
import { useCreateToolbarAction, useDeleteToolbarAction } from '../../../common/toolbar-actions'
import { getItemKey } from '../../../Data'
import { RouteE } from '../../../route'
import { useControllerView } from '../../useControllerView'
import { User } from './User'

export default function Users() {
    const { t } = useTranslation()

    // Toolbar Filters
    const emailToolbarFilter = useEmailToolbarFilter()
    const usernameToolbarFilter = useUsernameToolbarFilter()
    const firstnameByToolbarFilter = useFirstNameToolbarFilter()
    const lastnameToolbarFilter = useLastNameToolbarFilter()
    const toolbarFilters = useMemo<IToolbarFilter[]>(
        () => [emailToolbarFilter, usernameToolbarFilter, firstnameByToolbarFilter, lastnameToolbarFilter],
        [emailToolbarFilter, usernameToolbarFilter, firstnameByToolbarFilter, lastnameToolbarFilter]
    )

    // Toolbar Actions
    const createToolbarAction = useCreateToolbarAction(RouteE.CreateUser)
    const deleteToolbarAction = useDeleteToolbarAction(() => {
        // TODO
    })
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
                sort: 'username',
            },
            {
                header: t('First Name'),
                cell: (user) => <TextCell text={user.first_name} />,
                sort: 'first_name',
            },
            {
                header: t('Last Name'),
                cell: (user) => <TextCell text={user.last_name} />,
                sort: 'last_name',
            },
            createdColumn,
            modifiedColumn,
        ],
        [createdColumn, modifiedColumn, t]
    )

    // Row Actions
    const editItemAction = useEditItemAction(() => {
        // TODO
    })
    const deleteItemAction = useDeleteItemAction(() => {
        // TODO
    })
    const rowActions = useMemo<IItemAction<User>[]>(() => [editItemAction, deleteItemAction], [deleteItemAction, editItemAction])

    const view = useControllerView<User>('/api/v2/users/', getItemKey, toolbarFilters, tableColumns)

    return (
        <TablePage<User>
            title={t('Users')}
            titleHelpTitle={t('User')}
            description={t('A user is someone who has access to Tower with associated permissions and credentials.')}
            toolbarFilters={toolbarFilters}
            toolbarActions={toolbarActions}
            tableColumns={tableColumns}
            rowActions={rowActions}
            errorStateTitle={t('Error loading users')}
            emptyStateTitle={t('No users yet')}
            emptyStateDescription={t('To get started, create a user.')}
            emptyStateButtonText={t('Create user')}
            // emptyStateButtonClick={() => history.push(RouteE.CreateUser)}
            {...view}
        />
    )
}
