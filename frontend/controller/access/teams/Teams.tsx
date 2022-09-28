import { ButtonVariant, Nav, NavItem, NavList } from '@patternfly/react-core'
import { EditIcon, PlusIcon, TrashIcon } from '@patternfly/react-icons'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
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
    const history = useNavigate()

    const toolbarFilters = useTeamsFilters()

    const tableColumns = useTeamsColumns()

    const view = useControllerView<Team>('/api/v2/teams/', toolbarFilters, tableColumns)

    const deleteTeams = useDeleteTeams((deleted: Team[]) => {
        for (const team of deleted) {
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
                onClick: () => history(RouteE.CreateTeam),
            },
            {
                type: TypedActionType.bulk,
                icon: TrashIcon,
                label: t('Delete selected teams'),
                onClick: deleteTeams,
            },
        ],
        [deleteTeams, history, t]
    )

    const rowActions = useMemo<IItemAction<Team>[]>(
        () => [
            {
                icon: EditIcon,
                label: t('Edit team'),
                onClick: (team) => history(RouteE.EditTeam.replace(':id', team.id.toString())),
            },
            {
                icon: TrashIcon,
                label: t('Delete team'),
                onClick: (team) => deleteTeams([team]),
            },
        ],
        [deleteTeams, history, t]
    )

    return (
        <PageLayout>
            <PageHeader
                title={t('Teams')}
                titleHelpTitle={t('Team')}
                titleHelp={t('teams.title.help')}
                titleDocLink="https://docs.ansible.com/ansible-tower/latest/html/userguide/teams.html"
                description={t('teams.title.description')}
                navigation={
                    <Nav aria-label="Group section navigation" variant="tertiary">
                        <NavList>
                            <NavItem onClick={() => history(RouteE.Organizations)}>{t('Organizations')}</NavItem>
                            <NavItem onClick={() => history(RouteE.Teams)} isActive>
                                {t('Teams')}
                            </NavItem>
                            <NavItem onClick={() => history(RouteE.Users)}>{t('Users')}</NavItem>
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
                    emptyStateButtonClick={() => history(RouteE.CreateTeam)}
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

export function useTeamsColumns(options?: { disableLinks?: boolean; disableSort?: boolean }) {
    const history = useNavigate()
    const nameColumn = useNameColumn({
        ...options,
        onClick: (team) => history(RouteE.TeamDetails.replace(':id', team.id.toString())),
    })
    const descriptionColumn = useDescriptionColumn()
    const organizationColumn = useOrganizationNameColumn(options)
    const createdColumn = useCreatedColumn(options)
    const modifiedColumn = useModifiedColumn(options)
    const tableColumns = useMemo<ITableColumn<Team>[]>(
        () => [nameColumn, descriptionColumn, organizationColumn, createdColumn, modifiedColumn],
        [createdColumn, descriptionColumn, modifiedColumn, nameColumn, organizationColumn]
    )
    return tableColumns
}
