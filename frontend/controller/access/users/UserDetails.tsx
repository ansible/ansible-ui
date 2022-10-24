import {
  Alert,
  ButtonVariant,
  Divider,
  DropdownPosition,
  PageSection,
  Skeleton,
  Stack,
} from '@patternfly/react-core'
import { EditIcon, MinusCircleIcon, PlusIcon, TrashIcon } from '@patternfly/react-icons'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Detail,
  DetailsList,
  ITypedAction,
  PageBody,
  PageHeader,
  PageLayout,
  PageTab,
  PageTable,
  PageTabs,
  SinceCell,
  TypedActions,
  TypedActionType,
} from '../../../../framework'
import { DetailInfo } from '../../../../framework/components/DetailInfo'
import { Scrollable } from '../../../../framework/components/Scrollable'
import { useSettings } from '../../../../framework/Settings'
import { useItem } from '../../../common/useItem'
import { RouteE } from '../../../Routes'
import { useControllerView } from '../../useControllerView'
import { Organization } from '../organizations/Organization'
import { useOrganizationsColumns, useOrganizationsFilters } from '../organizations/Organizations'
import { Role } from '../roles/Role'
import { useRolesColumns, useRolesFilters } from '../roles/Roles'
import { Team } from '../teams/Team'
import { useTeamsColumns, useTeamsFilters } from '../teams/Teams'
import { useAddUserToTeams } from './hooks/useAddUserToTeams'
import { useDeleteUsers } from './hooks/useDeleteUsers'
import { useRemoveUserFromOrganizations } from './hooks/useRemoveUserFromOrganizations'
import { useRemoveUserFromSelectedTeams } from './hooks/useRemoveUserFromTeams'
import { useSelectOrganizationsAddUser } from './hooks/useSelectOrganizationsAddUser'
import { User } from './User'
import { UserType } from './Users'

export function UserDetailsPage() {
  const { t } = useTranslation()
  const params = useParams<{ id: string }>()
  const user = useItem<User>('/api/v2/users', params.id ?? '0')
  const history = useNavigate()

  const deleteUsers = useDeleteUsers((deleted: User[]) => {
    if (deleted.length > 0) {
      history(RouteE.Users)
    }
  })

  const itemActions: ITypedAction<User>[] = useMemo(() => {
    const itemActions: ITypedAction<User>[] = [
      {
        type: TypedActionType.button,
        variant: ButtonVariant.primary,
        icon: EditIcon,
        label: t('Edit user'),
        onClick: () => history(RouteE.EditUser.replace(':id', user?.id.toString() ?? '')),
      },
      {
        type: TypedActionType.button,
        icon: TrashIcon,
        label: t('Delete user'),
        onClick: () => {
          if (!user) return
          deleteUsers([user])
        },
      },
    ]
    return itemActions
  }, [t, history, user, deleteUsers])

  return (
    <PageLayout>
      <PageHeader
        title={user?.username}
        breadcrumbs={[{ label: t('Users'), to: RouteE.Users }, { label: user?.username }]}
        headerActions={
          <TypedActions<User> actions={itemActions} position={DropdownPosition.right} />
        }
      />
      <PageBody>
        {user ? (
          <PageTabs
          // preComponents={
          //     <Button variant="plain">
          //         <CaretLeftIcon /> &nbsp;Back to users
          //     </Button>
          // }
          // postComponents={
          //     <Button variant="plain">
          //         <CaretLeftIcon /> &nbsp;Back to users
          //     </Button>
          // }
          >
            <PageTab title={t('Details')}>
              <UserDetails user={user} />
            </PageTab>
            <PageTab title={t('Organizations')}>
              <UserOrganizations user={user} />
            </PageTab>
            <PageTab title={t('Teams')}>
              <UserTeams user={user} />
            </PageTab>
            <PageTab title={t('Roles')}>
              <UserRoles user={user} />
            </PageTab>
          </PageTabs>
        ) : (
          <PageTabs>
            <PageTab>
              <PageSection variant="light">
                <Stack hasGutter>
                  <Skeleton />
                  <Skeleton />
                  <Skeleton />
                  <Skeleton />
                </Stack>
              </PageSection>
            </PageTab>
          </PageTabs>
        )}
      </PageBody>
    </PageLayout>
  )
}

function UserDetails(props: { user: User }) {
  const { t } = useTranslation()
  const { user } = props
  const settings = useSettings()
  return (
    <>
      {user.is_superuser && (
        <Alert
          variant="info"
          title={t('System administrators have unrestricted access to all resources.')}
          isInline
          style={{ border: 0 }}
        />
      )}
      <Scrollable>
        <PageSection
          variant="light"
          style={{
            backgroundColor:
              settings.theme === 'dark' ? 'var(--pf-global--BackgroundColor--300)' : undefined,
          }}
        >
          <DetailsList>
            <Detail label={t('Username')}>{user.username}</Detail>
            <Detail label={t('First name')}>{user.first_name}</Detail>
            <Detail label={t('Last name')}>{user.last_name}</Detail>
            <Detail label={t('Email')}>{user.email}</Detail>
            <Detail label={t('User type')}>
              <UserType user={user} />
            </Detail>
            <Detail label={t('Created')}>
              <SinceCell value={user.created} />
            </Detail>
            <Detail label={t('Modified')}>
              {user.modified && <SinceCell value={user.modified} />}
            </Detail>
          </DetailsList>
        </PageSection>
      </Scrollable>
    </>
  )
}

function UserOrganizations(props: { user: User }) {
  const { user } = props
  const { t } = useTranslation()
  const toolbarFilters = useOrganizationsFilters()
  const tableColumns = useOrganizationsColumns()
  const view = useControllerView<Organization>({
    url: `/api/v2/users/${user.id}/organizations/`,
    toolbarFilters,
    disableQueryString: true,
  })
  const addUserToOrganizations = useSelectOrganizationsAddUser(() => void view.refresh())
  // const removeUserFromOrganizations = useRemoveUserFromOrganizations(() => void view.refresh())
  const removeUserFromSelectedOrganizations = useRemoveUserFromOrganizations(
    () => void view.refresh()
  )
  const toolbarActions = useMemo<ITypedAction<Organization>[]>(
    () => [
      {
        type: TypedActionType.button,
        variant: ButtonVariant.primary,
        icon: PlusIcon,
        label: t('Add user to organizations'),
        onClick: () => addUserToOrganizations(user),
      },
      {
        type: TypedActionType.bulk,
        icon: MinusCircleIcon,
        label: t('Remove user from selected organizations'),
        onClick: () => removeUserFromSelectedOrganizations(user, view.selectedItems),
      },
    ],
    [addUserToOrganizations, removeUserFromSelectedOrganizations, t, user, view.selectedItems]
  )
  const rowActions = useMemo<ITypedAction<Organization>[]>(
    () => [
      {
        type: TypedActionType.single,
        icon: MinusCircleIcon,
        label: t('Remove user from organization'),
        onClick: (organization) => removeUserFromSelectedOrganizations(user, [organization]),
      },
    ],
    [removeUserFromSelectedOrganizations, t, user]
  )
  return (
    <>
      {user.is_superuser && (
        <Alert
          variant="info"
          title={t('System administrators have unrestricted access to all resources.')}
          isInline
          style={{ border: 0 }}
        />
      )}
      <DetailInfo disablePaddingTop>
        {t(
          'Adding a user to an organization adds them as a member only. Permissions can be granted using teams and user roles.'
        )}
      </DetailInfo>
      <Divider />
      <PageTable<Organization>
        toolbarFilters={toolbarFilters}
        tableColumns={tableColumns}
        toolbarActions={toolbarActions}
        rowActions={rowActions}
        errorStateTitle={t('Error loading organizations')}
        emptyStateTitle={t('User is not a member of any organizations.')}
        emptyStateDescription={t('To get started, add the user to an organization.')}
        emptyStateButtonText={t('Add user to organization')}
        emptyStateButtonClick={() => addUserToOrganizations(user)}
        {...view}
      />
    </>
  )
}

function UserTeams(props: { user: User }) {
  const { user } = props
  const { t } = useTranslation()
  const toolbarFilters = useTeamsFilters()
  const tableColumns = useTeamsColumns()
  const view = useControllerView<Team>({
    url: `/api/v2/users/${user.id}/teams/`,
    toolbarFilters,
    disableQueryString: true,
  })
  const addUserToTeams = useAddUserToTeams(() => void view.refresh())
  const removeUserFromSelectedTeams = useRemoveUserFromSelectedTeams(() => void view.refresh())
  const toolbarActions = useMemo<ITypedAction<Team>[]>(
    () => [
      {
        type: TypedActionType.button,
        variant: ButtonVariant.primary,
        icon: PlusIcon,
        label: t('Add user to teams'),
        onClick: () => addUserToTeams(user),
      },
      {
        type: TypedActionType.bulk,
        icon: MinusCircleIcon,
        label: t('Remove user from selected teams'),
        onClick: () => removeUserFromSelectedTeams(user, view.selectedItems),
      },
    ],
    [addUserToTeams, removeUserFromSelectedTeams, t, user, view.selectedItems]
  )
  const rowActions = useMemo<ITypedAction<Team>[]>(
    () => [
      {
        type: TypedActionType.single,
        icon: MinusCircleIcon,
        label: t('Remove user from team'),
        onClick: (team: Team) => removeUserFromSelectedTeams(user, [team]),
      },
    ],
    [removeUserFromSelectedTeams, t, user]
  )
  return (
    <>
      {user.is_superuser && (
        <Alert
          variant="info"
          title={t('System administrators have unrestricted access to all resources.')}
          isInline
          style={{ border: 0 }}
        />
      )}
      <DetailInfo disablePaddingTop>
        {t('Being a team member grants the user all the permissions of the team.')}
      </DetailInfo>
      <Divider />
      <PageTable<Team>
        toolbarFilters={toolbarFilters}
        tableColumns={tableColumns}
        toolbarActions={toolbarActions}
        rowActions={rowActions}
        errorStateTitle={t('Error loading teams')}
        emptyStateTitle={t('User is not a member of any teams.')}
        emptyStateDescription={t('To get started, add the user to a team.')}
        emptyStateButtonText={t('Add user to team')}
        emptyStateButtonClick={() => alert('TODO')}
        {...view}
      />
    </>
  )
}

function UserRoles(props: { user: User }) {
  const { user } = props
  const { t } = useTranslation()
  const toolbarFilters = useRolesFilters()
  const tableColumns = useRolesColumns()
  const toolbarActions = useMemo<ITypedAction<Role>[]>(
    () => [
      {
        type: TypedActionType.button,
        variant: ButtonVariant.primary,
        icon: PlusIcon,
        label: t('Add role to user'),
        shortLabel: t('Add role'),
        onClick: () => alert('TODO'),
      },
      {
        type: TypedActionType.bulk,
        icon: TrashIcon,
        label: t('Remove selected roles from user'),
        shortLabel: t('Remove roles'),
        onClick: () => alert('TODO'),
      },
    ],
    [t]
  )
  const rowActions = useMemo<ITypedAction<Role>[]>(
    () => [
      {
        type: TypedActionType.single,
        icon: TrashIcon,
        label: t('Remove role from user'),
        onClick: () => alert('TODO'),
      },
    ],
    [t]
  )
  const view = useControllerView<Role>({
    url: `/api/v2/users/${user.id}/roles/`,
    toolbarFilters,
    tableColumns,
    disableQueryString: true,
  })
  return (
    <>
      {user.is_superuser && (
        <Alert
          variant="info"
          title={t('System administrators have unrestricted access to all resources.')}
          isInline
          style={{ border: 0 }}
        />
      )}
      <PageTable<Role>
        toolbarFilters={toolbarFilters}
        tableColumns={tableColumns}
        toolbarActions={toolbarActions}
        rowActions={rowActions}
        errorStateTitle={t('Error loading roles')}
        emptyStateTitle={t('User does not have any roles.')}
        emptyStateDescription={t('To get started, add roles to the user.')}
        emptyStateButtonText={t('Add role to user')}
        // emptyStateButtonClick={() => history(RouteE.CreateUser)}
        {...view}
      />
    </>
  )
}
