import { ButtonVariant } from '@patternfly/react-core'
import {
  EditIcon,
  MinusCircleIcon,
  PlusCircleIcon,
  PlusIcon,
  TrashIcon,
} from '@patternfly/react-icons'
import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import {
  ITableColumn,
  IToolbarFilter,
  ITypedAction,
  TablePage,
  TypedActionType,
} from '../../../../framework'
import {
  useCreatedColumn,
  useDescriptionColumn,
  useModifiedColumn,
  useNameColumn,
  useOrganizationNameColumn,
} from '../../../common/columns'
import { RouteE } from '../../../Routes'
import {
  useCreatedByToolbarFilter,
  useModifiedByToolbarFilter,
  useNameToolbarFilter,
  useOrganizationToolbarFilter,
} from '../../common/controller-toolbar-filters'
import { useControllerView } from '../../useControllerView'
import { AccessNav } from '../common/AccessNav'
import { useSelectUsersAddTeams } from '../users/hooks/useSelectUsersAddTeams'
import { useSelectUsersRemoveTeams } from '../users/hooks/useSelectUsersRemoveTeams'
import { useDeleteTeams } from './hooks/useDeleteTeams'
import { Team } from './Team'

export function Teams() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const toolbarFilters = useTeamsFilters()

  const tableColumns = useTeamsColumns()

  const view = useControllerView<Team>({ url: '/api/v2/teams/', toolbarFilters, tableColumns })

  const deleteTeams = useDeleteTeams((teams: Team[]) => {
    view.unselectItems(teams)
    void view.refresh()
  })

  const selectUsersAddTeams = useSelectUsersAddTeams()
  const selectUsersRemoveTeams = useSelectUsersRemoveTeams()

  const toolbarActions = useMemo<ITypedAction<Team>[]>(
    () => [
      {
        type: TypedActionType.button,
        variant: ButtonVariant.primary,
        icon: PlusIcon,
        label: t('Create team'),
        onClick: () => navigate(RouteE.CreateTeam),
      },
      { type: TypedActionType.seperator },
      {
        type: TypedActionType.bulk,
        icon: PlusCircleIcon,
        label: t('Add users to selected teams'),
        onClick: () => selectUsersAddTeams(view.selectedItems),
      },
      {
        type: TypedActionType.bulk,
        icon: MinusCircleIcon,
        label: t('Remove users from selected teams'),
        onClick: () => selectUsersRemoveTeams(view.selectedItems),
      },
      { type: TypedActionType.seperator },
      {
        type: TypedActionType.bulk,
        icon: TrashIcon,
        label: t('Delete selected teams'),
        onClick: deleteTeams,
      },
    ],
    [deleteTeams, navigate, selectUsersAddTeams, selectUsersRemoveTeams, t, view.selectedItems]
  )

  const rowActions = useMemo<ITypedAction<Team>[]>(
    () => [
      {
        type: TypedActionType.single,
        // variant: ButtonVariant.primary,
        icon: EditIcon,
        label: t('Edit team'),
        onClick: (team) => navigate(RouteE.EditTeam.replace(':id', team.id.toString())),
      },
      { type: TypedActionType.seperator },
      {
        type: TypedActionType.single,
        icon: PlusCircleIcon,
        label: t('Add users to team'),
        onClick: (team) => selectUsersAddTeams([team]),
      },
      {
        type: TypedActionType.single,
        icon: MinusCircleIcon,
        label: t('Remove users from team'),
        onClick: (team) => selectUsersRemoveTeams([team]),
      },
      { type: TypedActionType.seperator },
      {
        type: TypedActionType.single,
        icon: TrashIcon,
        label: t('Delete team'),
        onClick: (team) => deleteTeams([team]),
      },
    ],
    [deleteTeams, navigate, selectUsersAddTeams, selectUsersRemoveTeams, t]
  )

  return (
    <TablePage
      title={t('Teams')}
      titleHelpTitle={t('Team')}
      titleHelp={t('teams.title.help')}
      titleDocLink="https://docs.ansible.com/ansible-tower/latest/html/userguide/teams.html"
      description={t('teams.title.description')}
      navigation={<AccessNav active="teams" />}
      toolbarFilters={toolbarFilters}
      toolbarActions={toolbarActions}
      tableColumns={tableColumns}
      rowActions={rowActions}
      errorStateTitle={t('Error loading teams')}
      emptyStateTitle={t('No teams yet')}
      emptyStateDescription={t('To get started, create a team.')}
      emptyStateButtonText={t('Create team')}
      emptyStateButtonClick={() => navigate(RouteE.CreateTeam)}
      {...view}
      defaultCardSubtitle={t('Team')}
    />
  )
}

export function useTeamsFilters() {
  const nameToolbarFilter = useNameToolbarFilter()
  const organizationToolbarFilter = useOrganizationToolbarFilter()
  const createdByToolbarFilter = useCreatedByToolbarFilter()
  const modifiedByToolbarFilter = useModifiedByToolbarFilter()
  const toolbarFilters = useMemo<IToolbarFilter[]>(
    () => [
      nameToolbarFilter,
      organizationToolbarFilter,
      createdByToolbarFilter,
      modifiedByToolbarFilter,
    ],
    [nameToolbarFilter, organizationToolbarFilter, createdByToolbarFilter, modifiedByToolbarFilter]
  )
  return toolbarFilters
}

export function useTeamsColumns(options?: { disableLinks?: boolean; disableSort?: boolean }) {
  const { t } = useTranslation()
  const history = useNavigate()
  const nameColumnClick = useCallback(
    (team: Team) => history(RouteE.TeamDetails.replace(':id', team.id.toString())),
    [history]
  )
  const nameColumn = useNameColumn({ header: t('Team'), ...options, onClick: nameColumnClick })
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
