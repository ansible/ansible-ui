import { ButtonVariant, Chip, ChipGroup, Text } from '@patternfly/react-core'
import {
  EditIcon,
  MinusCircleIcon,
  PlusCircleIcon,
  PlusIcon,
  TrashIcon,
} from '@patternfly/react-icons'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
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
import { RouteE } from '../../../Routes'
import {
  useFirstNameToolbarFilter,
  useLastNameToolbarFilter,
  useUsernameToolbarFilter,
} from '../../common/controller-toolbar-filters'
import { useControllerView } from '../../useControllerView'
import { AccessNav } from '../common/AccessNav'
import { useAddUsersToOrganizations } from './hooks/useAddUsersToOrganizations'
import { useAddUsersToTeams } from './hooks/useAddUsersToTeams'
import { useAddUserToOrganizations } from './hooks/useAddUserToOrganizations'
import { useDeleteUsers } from './hooks/useDeleteUsers'
import { useRemoveUsersFromOrganizations } from './hooks/useRemoveUsersFromOrganizations'
import { User } from './User'

export function Users() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const toolbarFilters = useUsersFilters()

  const tableColumns = useUsersColumns()

  const view = useControllerView<User>({ url: '/api/v2/users/', toolbarFilters, tableColumns })

  const deleteUsers = useDeleteUsers((deleted: User[]) => {
    for (const user of deleted) {
      view.unselectItem(user)
    }
    void view.refresh()
  })

  const addUsersToTeams = useAddUsersToTeams()
  const addUserToOrganizations = useAddUserToOrganizations()
  const addUsersToOrganizations = useAddUsersToOrganizations()
  const removeUsersFromOrganizations = useRemoveUsersFromOrganizations()

  const toolbarActions = useMemo<ITypedAction<User>[]>(
    () => [
      {
        type: TypedActionType.button,
        variant: ButtonVariant.primary,
        icon: PlusIcon,
        label: t('Create user'),
        onClick: () => navigate(RouteE.CreateUser),
      },
      { type: TypedActionType.seperator },
      {
        type: TypedActionType.bulk,
        icon: PlusCircleIcon,
        label: t('Add selected users to teams'),
        onClick: () => addUsersToTeams(view.selectedItems),
      },
      { type: TypedActionType.seperator },
      {
        type: TypedActionType.bulk,
        icon: PlusCircleIcon,
        label: t('Add selected users to organizations'),
        onClick: () => addUsersToOrganizations(view.selectedItems),
      },
      {
        type: TypedActionType.bulk,
        icon: MinusCircleIcon,
        label: t('Remove selected users from organizations'),
        onClick: () => removeUsersFromOrganizations(view.selectedItems),
      },
      { type: TypedActionType.seperator },
      {
        type: TypedActionType.bulk,
        icon: TrashIcon,
        label: t('Delete selected users'),
        onClick: deleteUsers,
      },
    ],
    [
      t,
      deleteUsers,
      navigate,
      addUsersToTeams,
      view.selectedItems,
      addUsersToOrganizations,
      removeUsersFromOrganizations,
    ]
  )

  const rowActions = useMemo<IItemAction<User>[]>(
    () => [
      {
        icon: EditIcon,
        label: t('Edit user'),
        onClick: (user) => navigate(RouteE.EditUser.replace(':id', user.id.toString())),
      },
      {
        icon: PlusCircleIcon,
        label: t('Add user to organizations'),
        onClick: (user) => addUserToOrganizations(user),
      },
      {
        icon: TrashIcon,
        label: t('Delete user'),
        onClick: (user) => deleteUsers([user]),
      },
    ],
    [addUserToOrganizations, deleteUsers, navigate, t]
  )

  return (
    <TablePage<User>
      title={t('Users')}
      titleHelpTitle={t('User')}
      titleHelp={t('users.title.help')}
      titleDocLink="https://docs.ansible.com/ansible-tower/latest/html/userguide/users.html"
      description={t('users.title.description')}
      navigation={<AccessNav active="users" />}
      toolbarFilters={toolbarFilters}
      toolbarActions={toolbarActions}
      tableColumns={tableColumns}
      rowActions={rowActions}
      errorStateTitle={t('Error loading users')}
      emptyStateTitle={t('No users yet')}
      emptyStateDescription={t('To get started, create a user.')}
      emptyStateButtonText={t('Create user')}
      emptyStateButtonClick={() => navigate(RouteE.CreateUser)}
      {...view}
    />
  )
}

export function AccessTable(props: { url: string }) {
  const { t } = useTranslation()

  const toolbarFilters = useUsersFilters()

  const tableColumns = useUsersColumns()

  const view = useControllerView<User>({
    url: props.url,
    toolbarFilters,
    tableColumns,
    disableQueryString: true,
  })

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

  const navigate = useNavigate()

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
      emptyStateButtonClick={() => navigate(RouteE.CreateUser)}
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

export function useUsersColumns(_options?: { disableLinks?: boolean; disableSort?: boolean }) {
  const { t } = useTranslation()
  const tableColumns = useMemo<ITableColumn<User>[]>(
    () => [
      {
        header: t('Username'),
        cell: (user) => (
          <TextCell
            text={user.username}
            to={RouteE.UserDetails.replace(':id', user.id.toString())}
          />
        ),
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
    ],
    [t]
  )
  return tableColumns
}

export function UserType(props: { user: User }) {
  const { user } = props
  const { t } = useTranslation()
  if (user.is_superuser) return <Text> {t('System administrator')}</Text>
  if (user.is_system_auditor) return <Text>{t('System auditor')}</Text>
  return <Text>{t('Normal user')}</Text>
}

export function UserRoles(props: { user: User }) {
  const { user } = props
  const { t } = useTranslation()
  return (
    <ChipGroup>
      {user.is_superuser && <Chip isReadOnly>{t('System administrator')}</Chip>}
      {!user.is_superuser && <Chip isReadOnly>{t('Normal user')}</Chip>}
    </ChipGroup>
  )
}
