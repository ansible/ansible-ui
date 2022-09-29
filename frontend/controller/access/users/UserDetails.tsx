import { ButtonVariant, DropdownPosition, PageSection, Skeleton, Stack } from '@patternfly/react-core'
import { EditIcon, PlusIcon, TrashIcon } from '@patternfly/react-icons'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'
import {
    Detail,
    DetailsList,
    IItemAction,
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
import { Scrollable } from '../../../../framework/components/Scrollable'
import { useSettings } from '../../../../framework/Settings'
import { useItem } from '../../../common/useItem'
import { RouteE } from '../../../route'
import { useControllerView } from '../../useControllerView'
import { Organization } from '../organizations/Organization'
import { useOrganizationsColumns, useOrganizationsFilters } from '../organizations/Organizations'
import { Role } from '../roles/Role'
import { useRolesColumns, useRolesFilters } from '../roles/Roles'
import { Team } from '../teams/Team'
import { useTeamsColumns, useTeamsFilters } from '../teams/Teams'
import { useDeleteUsers } from './useDeleteUsers'
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
                headerActions={<TypedActions<User> actions={itemActions} dropdownPosition={DropdownPosition.right} />}
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
            <Scrollable>
                <PageSection
                    variant="light"
                    style={{ backgroundColor: settings.theme === 'dark' ? 'var(--pf-global--BackgroundColor--300)' : undefined }}
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
                        <Detail label={t('Modified')}>{user.modified && <SinceCell value={user.modified} />}</Detail>
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
    const view = useControllerView<Organization>(`/api/v2/users/${user.id}/organizations/`, toolbarFilters)
    return (
        <PageTable<Organization>
            toolbarFilters={toolbarFilters}
            tableColumns={tableColumns}
            errorStateTitle={t('Error loading organizations')}
            emptyStateTitle={user.is_superuser ? t('System administrator') : t('No organizations yet')}
            emptyStateDescription={
                user.is_superuser
                    ? t('System administrators have unrestricted access to all resources.')
                    : t('To get started, create an organization.')
            }
            emptyStateButtonText={t('Create organization')}
            // emptyStateButtonClick={() => history(RouteE.CreateUser)}
            {...view}
        />
    )
}

function UserTeams(props: { user: User }) {
    const { user } = props
    const { t } = useTranslation()
    const toolbarFilters = useTeamsFilters()
    const tableColumns = useTeamsColumns()
    const view = useControllerView<Team>(`/api/v2/users/${user.id}/teams/`, toolbarFilters)
    return (
        <PageTable<Team>
            toolbarFilters={toolbarFilters}
            tableColumns={tableColumns}
            errorStateTitle={t('Error loading teams')}
            emptyStateTitle={user.is_superuser ? t('System administrator') : t('User is not in any teams.')}
            emptyStateDescription={
                user.is_superuser
                    ? t('System administrators have unrestricted access to all resources.')
                    : t('To get started, add the user to a team.')
            }
            emptyStateButtonText={t('Add user to teams')}
            emptyStateButtonClick={() => alert('TODO')}
            {...view}
        />
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
    const rowActions = useMemo<IItemAction<Role>[]>(
        () => [
            {
                icon: TrashIcon,
                label: t('Remove role from user'),
                onClick: () => alert('TODO'),
            },
        ],
        [t]
    )
    const view = useControllerView<Role>(`/api/v2/users/${user.id}/roles/`, toolbarFilters, tableColumns)
    return (
        <PageTable<Role>
            toolbarFilters={toolbarFilters}
            tableColumns={tableColumns}
            toolbarActions={toolbarActions}
            rowActions={rowActions}
            errorStateTitle={t('Error loading roles')}
            emptyStateTitle={user.is_superuser ? t('System administrator') : t('User does not have any roles.')}
            emptyStateDescription={
                user.is_superuser
                    ? t('System administrators have unrestricted access to all resources.')
                    : t('To get started, add roles to the user.')
            }
            emptyStateButtonText={t('Add role to user')}
            // emptyStateButtonClick={() => history(RouteE.CreateUser)}
            {...view}
        />
    )
}
