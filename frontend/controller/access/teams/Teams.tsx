import { ButtonVariant, Nav, NavItem, NavList } from '@patternfly/react-core'
import { EditIcon, PlusIcon, TrashIcon } from '@patternfly/react-icons'
import { useMemo } from 'react'
import { useHistory } from 'react-router-dom'
import {
    IItemAction,
    ITableColumn,
    IToolbarFilter,
    ITypedAction,
    PageBody,
    PageHeader,
    PageLayout,
    PageTable,
    TypedActionType,
} from '../../../../framework'
import { useTranslation } from '../../../../framework/components/useTranslation'
import {
    useCreatedColumn,
    useDescriptionColumn,
    useModifiedColumn,
    useNameColumn,
    useOrganizationNameColumn,
} from '../../../common/columns'
import {
    useCreatedByToolbarFilter,
    useModifiedByToolbarFilter,
    useNameToolbarFilter,
    useOrganizationToolbarFilter,
} from '../../../common/controller-toolbar-filters'
import { RouteE } from '../../../route'
import { useControllerView } from '../../useControllerView'
import { Team } from './Team'
import { useDeleteTeams } from './useDeleteTeams'

export function Teams() {
    const { t } = useTranslation()
    const history = useHistory()

    const toolbarFilters = useTeamsFilters()

    const tableColumns = useTeamsColumns()

    const view = useControllerView<Team>('/api/v2/teams/', toolbarFilters, tableColumns)

    const postDeleteTeams = useDeleteTeams((deletedTeams: Team[]) => {
        for (const team of deletedTeams) {
            view.unselectItem(team)
        }
        void view.refresh()
    })

    const toolbarActions = useMemo<ITypedAction<Team>[]>(
        () => [
            {
                type: TypedActionType.button,
                variant: ButtonVariant.primary,
                icon: PlusIcon,
                label: t('Create team'),
                onClick: () => history.push(RouteE.CreateTeam),
            },
            {
                type: TypedActionType.bulk,
                icon: TrashIcon,
                label: t('Delete selected teams'),
                onClick: postDeleteTeams,
            },
        ],
        [postDeleteTeams, history, t]
    )

    const rowActions = useMemo<IItemAction<Team>[]>(
        () => [
            {
                icon: EditIcon,
                label: t('Edit team'),
                onClick: (team: Team) => history.push(RouteE.EditTeam.replace(':id', team.id.toString())),
            },
            {
                icon: TrashIcon,
                label: t('Delete team'),
                onClick: (item: Team) => postDeleteTeams([item]),
            },
        ],
        [postDeleteTeams, history, t]
    )

    return (
        <PageLayout>
            <PageHeader
                title={t('Teams')}
                titleHelpTitle={t('Team')}
                titleHelp="A Team is a subdivision of an organization with associated users, projects, credentials, and permissions. Teams provide a means to implement role-based access control schemes and delegate responsibilities across organizations. For instance, permissions may be granted to a whole Team rather than each user on the Team."
                titleDocLink="https://docs.ansible.com/ansible-tower/latest/html/userguide/teams.html"
                description="A Team is a subdivision of an organization with associated users, projects, credentials, and permissions."
                navigation={
                    <Nav aria-label="Group section navigation" variant="tertiary">
                        <NavList>
                            <NavItem onClick={() => history.push(RouteE.Organizations)}>Organizations</NavItem>
                            <NavItem onClick={() => history.push(RouteE.Teams)} isActive>
                                Teams
                            </NavItem>
                            <NavItem onClick={() => history.push(RouteE.Users)}>Users</NavItem>
                        </NavList>
                    </Nav>
                }
            />
            <PageBody>
                <PageTable<Team>
                    toolbarFilters={toolbarFilters}
                    toolbarActions={toolbarActions}
                    tableColumns={tableColumns}
                    rowActions={rowActions}
                    errorStateTitle={t('Error loading teams')}
                    emptyStateTitle={t('No teams yet')}
                    emptyStateDescription={t('To get started, create a team.')}
                    emptyStateButtonText={t('Create team')}
                    emptyStateButtonClick={() => history.push(RouteE.CreateTeam)}
                    {...view}
                />
            </PageBody>
        </PageLayout>
    )
}

export function useTeamsFilters() {
    const nameToolbarFilter = useNameToolbarFilter()
    const organizationToolbarFilter = useOrganizationToolbarFilter()
    const createdByToolbarFilter = useCreatedByToolbarFilter()
    const modifiedByToolbarFilter = useModifiedByToolbarFilter()
    const toolbarFilters = useMemo<IToolbarFilter[]>(
        () => [nameToolbarFilter, organizationToolbarFilter, createdByToolbarFilter, modifiedByToolbarFilter],
        [nameToolbarFilter, organizationToolbarFilter, createdByToolbarFilter, modifiedByToolbarFilter]
    )
    return toolbarFilters
}

export function useTeamsColumns(onClick?: (team: Team) => void) {
    const nameColumn = useNameColumn(onClick ? { onClick } : { url: RouteE.TeamDetails })
    const descriptionColumn = useDescriptionColumn()
    const organizationColumn = useOrganizationNameColumn()
    const createdColumn = useCreatedColumn()
    const modifiedColumn = useModifiedColumn()
    const tableColumns = useMemo<ITableColumn<Team>[]>(
        () => [nameColumn, descriptionColumn, organizationColumn, createdColumn, modifiedColumn],
        [createdColumn, descriptionColumn, modifiedColumn, nameColumn, organizationColumn]
    )
    return tableColumns
}
