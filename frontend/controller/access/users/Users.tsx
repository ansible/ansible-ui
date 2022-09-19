import { ButtonVariant, Chip, ChipGroup, Text } from '@patternfly/react-core'
import { EditIcon, MinusCircleIcon, PlusIcon, TrashIcon } from '@patternfly/react-icons'
import { useMemo } from 'react'
import { useHistory } from 'react-router-dom'
import {
    IItemAction,
    ITableColumn,
    IToolbarFilter,
    ITypedAction,
    PageTable,
    SinceCell,
    TablePage,
    TextCell,
    TypedActionType,
} from '../../../../framework'
import { useTranslation } from '../../../../framework/components/useTranslation'
import { useFirstNameToolbarFilter, useLastNameToolbarFilter, useUsernameToolbarFilter } from '../../../common/controller-toolbar-filters'
import { RouteE } from '../../../route'
import { useControllerView } from '../../useControllerView'
import { User } from './User'

export function Users() {
    const { t } = useTranslation()
    const history = useHistory()

    const toolbarFilters = useUsersFilters()

    const toolbarActions = useMemo<ITypedAction<User>[]>(
        () => [
            {
                type: TypedActionType.button,
                variant: ButtonVariant.primary,
                icon: PlusIcon,
                label: t('Create user'),
                onClick: () => history.push(RouteE.CreateUser),
            },
            {
                type: TypedActionType.bulk,
                icon: TrashIcon,
                label: t('Delete selected users'),
                onClick: () => alert('TODO'),
            },
        ],
        [history, t]
    )

    const tableColumns = useUsersColumns()

    const rowActions = useMemo<IItemAction<User>[]>(
        () => [
            {
                icon: EditIcon,
                label: t('Edit user'),
                onClick: (user: User) => history.push(RouteE.EditUser.replace(':id', user.id.toString())),
            },
            {
                icon: TrashIcon,
                label: t('Delete user'),
                onClick: () => alert('TODO'),
            },
        ],
        [history, t]
    )

    const view = useControllerView<User>('/api/v2/users/', toolbarFilters, tableColumns)

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
            emptyStateButtonClick={() => history.push(RouteE.CreateUser)}
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
                label: t('Add users'),
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
                onClick: () => alert('TODO'),
            },
        ],
        [t]
    )

    const view = useControllerView<User>(props.url, toolbarFilters, tableColumns)

    const history = useHistory()

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
            emptyStateButtonClick={() => history.push(RouteE.CreateUser)}
            {...view}
        />
    )
}

export function useUsersFilters() {
    const { t } = useTranslation()
    const usernameToolbarFilter = useUsernameToolbarFilter()
    const firstnameByToolbarFilter = useFirstNameToolbarFilter()
    const lastnameToolbarFilter = useLastNameToolbarFilter()
    const toolbarFilters = useMemo<IToolbarFilter[]>(
        () => [
            usernameToolbarFilter,
            firstnameByToolbarFilter,
            lastnameToolbarFilter,
            {
                key: 'email',
                label: t('Email'),
                type: 'string',
                query: 'email__icontains',
            },
        ],
        [usernameToolbarFilter, firstnameByToolbarFilter, lastnameToolbarFilter, t]
    )
    return toolbarFilters
}

export function useUsersColumns() {
    const { t } = useTranslation()
    const tableColumns = useMemo<ITableColumn<User>[]>(
        () => [
            {
                header: t('Username'),
                cell: (user) => <TextCell text={user.username} to={RouteE.UserDetails.replace(':id', user.id.toString())} />,
                sort: 'username',
                maxWidth: 200,
            },
            {
                header: t('First name'),
                cell: (user) => <TextCell text={user.first_name} />,
                sort: 'first_name',
            },
            {
                header: t('Last name'),
                cell: (user) => <TextCell text={user.last_name} />,
                sort: 'last_name',
            },
            {
                header: t('Email'),
                cell: (user) => <TextCell text={user.email} />,
                sort: 'email',
            },
            {
                header: t('User type'),
                cell: (user) => <UserType user={user} />,
            },
            {
                header: t('Created'),
                cell: (item) => <SinceCell value={item.created} />,
            },
            {
                header: t('Last modified'),
                cell: (item) => <SinceCell value={item.modified} />,
            },
        ],
        [t]
    )
    return tableColumns
}

export function UserType(props: { user: User }) {
    const { user } = props
    if (user.is_superuser) return <Text>System administraitor</Text>
    if (user.is_system_auditor) return <Text>System auditor</Text>
    return <Text>Normal user</Text>
}

export function UserRoles(props: { user: User }) {
    const { user } = props
    return (
        <ChipGroup>
            {user.is_superuser && <Chip isReadOnly>System administraitor</Chip>}
            {!user.is_superuser && <Chip isReadOnly>Normal user</Chip>}
        </ChipGroup>
    )
}
