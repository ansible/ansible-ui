import { ButtonVariant, Chip, ChipGroup } from '@patternfly/react-core'
import { MinusCircleIcon, PlusIcon } from '@patternfly/react-icons'
import { useMemo } from 'react'
import {
    IItemAction,
    ITableColumn,
    IToolbarFilter,
    ITypedAction,
    PageTable,
    TablePage,
    TextCell,
    TypedActionType,
} from '../../../../framework'
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
    const toolbarFilters = useUsersFilters()

    // Toolbar Actions
    const createToolbarAction = useCreateToolbarAction(RouteE.CreateUser)
    const deleteToolbarAction = useDeleteToolbarAction(() => {
        // TODO
    })
    const toolbarActions = useMemo<ITypedAction<User>[]>(
        () => [createToolbarAction, deleteToolbarAction],
        [createToolbarAction, deleteToolbarAction]
    )

    // Table Columns
    const tableColumns = useUsersColumns()

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

export function AccessTable(props: { url: string }) {
    const { t } = useTranslation()

    // Toolbar Filters
    const toolbarFilters = useUsersFilters()

    // Toolbar Actions
    const toolbarActions = useMemo<ITypedAction<User>[]>(
        () => [
            {
                type: TypedActionType.button,
                variant: ButtonVariant.primary,
                icon: PlusIcon,
                label: t('Add userss'),
                shortLabel: t('Add'),
                onClick: () => null,
            },
            {
                type: TypedActionType.bulk,
                variant: ButtonVariant.primary,
                icon: MinusCircleIcon,
                label: t('Remove selected users'),
                shortLabel: t('Remove'),
                onClick: () => null,
                isDanger: true,
            },
        ],
        [t]
    )

    // Table Columns
    const tableColumns = useUsersColumns()

    // Row Actions
    const rowActions = useMemo<IItemAction<User>[]>(
        () => [
            {
                icon: MinusCircleIcon,
                label: t('Remove user'),
                onClick: () => {
                    // TODO
                },
            },
        ],
        [t]
    )

    const view = useControllerView<User>(props.url, getItemKey, toolbarFilters, tableColumns)

    return (
        <PageTable<User>
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

export function useUsersFilters() {
    const emailToolbarFilter = useEmailToolbarFilter()
    const usernameToolbarFilter = useUsernameToolbarFilter()
    const firstnameByToolbarFilter = useFirstNameToolbarFilter()
    const lastnameToolbarFilter = useLastNameToolbarFilter()
    const toolbarFilters = useMemo<IToolbarFilter[]>(
        () => [emailToolbarFilter, usernameToolbarFilter, firstnameByToolbarFilter, lastnameToolbarFilter],
        [emailToolbarFilter, usernameToolbarFilter, firstnameByToolbarFilter, lastnameToolbarFilter]
    )
    return toolbarFilters
}

export function useUsersColumns() {
    const { t } = useTranslation()

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
            {
                header: t('Email'),
                cell: (user) => <TextCell text={user.email} />,
                sort: 'email',
            },
            {
                header: t('Roles'),
                cell: (user) => (
                    <ChipGroup>
                        {user.is_superuser && <Chip isReadOnly>System Administraitor</Chip>}
                        {!user.is_superuser && <Chip isReadOnly>Normal User</Chip>}
                    </ChipGroup>
                ),
            },
            createdColumn,
            modifiedColumn,
        ],
        [createdColumn, modifiedColumn, t]
    )
    return tableColumns
}
