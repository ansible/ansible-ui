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
  IPageAction,
  ITableColumn,
  IToolbarFilter,
  PageActionType,
  PageTable,
  SinceCell,
  TablePage,
  TextCell,
} from '../../../../framework'
import { RouteE } from '../../../Routes'
import {
  useFirstNameToolbarFilter,
  useLastNameToolbarFilter,
  useUsernameToolbarFilter,
} from '../../common/controller-toolbar-filters'
import { User } from '../../interfaces/User'
import { useControllerView } from '../../useControllerView'
import { AccessNav } from '../common/AccessNav'
import { useSelectOrganizationsAddUsers } from '../organizations/hooks/useSelectOrganizationsAddUsers'
import { useSelectOrganizationsRemoveUsers } from '../organizations/hooks/useSelectOrganizationsRemoveUsers'
import { useSelectTeamsAddUsers } from '../teams/hooks/useSelectTeamsAddUsers'
import { useSelectTeamsRemoveUsers } from '../teams/hooks/useSelectTeamsRemoveUsers'
import { useDeleteUsers } from './hooks/useDeleteUsers'

export function Users() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const toolbarFilters = useUsersFilters()

  const tableColumns = useUsersColumns()

  const view = useControllerView<User>({ url: '/api/v2/users/', toolbarFilters, tableColumns })

  const deleteUsers = useDeleteUsers(view.unselectItemsAndRefresh)

  const selectOrganizationsAddUsers = useSelectOrganizationsAddUsers()
  const selectTeamsAddUsers = useSelectTeamsAddUsers()
  const selectOrganizationsRemoveUsers = useSelectOrganizationsRemoveUsers()
  const selectTeamsRemoveUsers = useSelectTeamsRemoveUsers()

  const toolbarActions = useMemo<IPageAction<User>[]>(
    () => [
      {
        type: PageActionType.button,
        variant: ButtonVariant.primary,
        icon: PlusIcon,
        label: t('Create user'),
        onClick: () => navigate(RouteE.CreateUser),
      },
      { type: PageActionType.seperator },
      {
        type: PageActionType.bulk,
        icon: PlusCircleIcon,
        label: t('Add selected users to teams'),
        onClick: () => selectTeamsAddUsers(view.selectedItems),
      },
      {
        type: PageActionType.bulk,
        icon: MinusCircleIcon,
        label: t('Remove selected users from teams'),
        onClick: () => selectTeamsRemoveUsers(view.selectedItems),
      },
      { type: PageActionType.seperator },
      {
        type: PageActionType.bulk,
        icon: PlusCircleIcon,
        label: t('Add selected users to organizations'),
        onClick: () => selectOrganizationsAddUsers(view.selectedItems),
      },
      {
        type: PageActionType.bulk,
        icon: MinusCircleIcon,
        label: t('Remove selected users from organizations'),
        onClick: () => selectOrganizationsRemoveUsers(view.selectedItems),
      },
      { type: PageActionType.seperator },
      {
        type: PageActionType.bulk,
        icon: TrashIcon,
        label: t('Delete selected users'),
        onClick: deleteUsers,
      },
    ],
    [
      t,
      deleteUsers,
      navigate,
      selectTeamsAddUsers,
      view.selectedItems,
      selectTeamsRemoveUsers,
      selectOrganizationsAddUsers,
      selectOrganizationsRemoveUsers,
    ]
  )

  const rowActions = useMemo<IPageAction<User>[]>(
    () => [
      {
        type: PageActionType.single,
        // variant: ButtonVariant.primary,
        icon: EditIcon,
        label: t('Edit user'),
        onClick: (user) => navigate(RouteE.EditUser.replace(':id', user.id.toString())),
      },
      { type: PageActionType.seperator },
      {
        type: PageActionType.single,
        icon: PlusCircleIcon,
        label: t('Add user to teams'),
        onClick: (user) => selectTeamsAddUsers([user]),
      },
      {
        type: PageActionType.single,
        icon: MinusCircleIcon,
        label: t('Remove user from teams'),
        onClick: (user) => selectTeamsRemoveUsers([user]),
      },
      { type: PageActionType.seperator },
      {
        type: PageActionType.single,
        icon: PlusCircleIcon,
        label: t('Add user to organizations'),
        onClick: (user) => selectOrganizationsAddUsers([user]),
      },
      {
        type: PageActionType.single,
        icon: MinusCircleIcon,
        label: t('Remove user from organizations'),
        onClick: (user) => selectOrganizationsRemoveUsers([user]),
      },
      { type: PageActionType.seperator },
      {
        type: PageActionType.single,
        icon: TrashIcon,
        label: t('Delete user'),
        onClick: (user) => deleteUsers([user]),
      },
    ],
    [
      deleteUsers,
      navigate,
      selectOrganizationsAddUsers,
      selectOrganizationsRemoveUsers,
      selectTeamsAddUsers,
      selectTeamsRemoveUsers,
      t,
    ]
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

  const toolbarActions = useMemo<IPageAction<User>[]>(
    () => [
      {
        type: PageActionType.button,
        variant: ButtonVariant.primary,
        icon: PlusIcon,
        label: t('Add users'),
        shortLabel: t('Add'),
        onClick: () => null,
      },
      {
        type: PageActionType.bulk,
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

  const rowActions = useMemo<IPageAction<User>[]>(
    () => [
      {
        type: PageActionType.single,
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
        card: 'name',
        list: 'name',
        sort: 'username',
        maxWidth: 200,
      },
      {
        header: t('User type'),
        cell: (user) => <UserType user={user} />,
        card: 'subtitle',
        list: 'subtitle',
      },
      {
        header: t('First name'),
        cell: (user) => user.first_name && <TextCell text={user.first_name} />,
        sort: 'first_name',
      },
      {
        header: t('Last name'),
        cell: (user) => user.last_name && <TextCell text={user.last_name} />,
        sort: 'last_name',
      },
      {
        header: t('Email'),
        cell: (user) => user.email && <TextCell text={user.email} />,
        sort: 'email',
      },
      {
        header: t('Created'),
        cell: (item) => <SinceCell value={item.created} />,
        card: 'hidden',
        list: 'secondary',
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
