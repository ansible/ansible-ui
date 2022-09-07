import { PlusIcon } from '@patternfly/react-icons'
import { useMemo } from 'react'
import { useHistory } from 'react-router-dom'
import { IItemAction, ITableColumn, IToolbarAction, ToolbarActionType } from '../../../../framework'
import { BulkActionDialog } from '../../../../framework/BulkActionDialog'
import { useTranslation } from '../../../../framework/components/useTranslation'
import { useDialog } from '../../../../framework/DialogContext'
import { IToolbarFilter } from '../../../../framework/PageToolbar'
import { TablePage } from '../../../../framework/TablePage'
import { useCreatedColumn, useModifiedColumn, useNameColumn, useOrganizationNameColumn } from '../../../common/columns'
import { compareStrings } from '../../../common/compare'
import {
    useCreatedByToolbarFilter,
    useModifiedByToolbarFilter,
    useNameToolbarFilter,
    useOrganizationToolbarFilter,
} from '../../../common/controller-toolbar-filters'
import { useDeleteItemAction, useEditItemAction } from '../../../common/item-actions'
import { randomString } from '../../../common/random-string'
import { useCreateToolbarAction, useDeleteToolbarAction } from '../../../common/toolbar-actions'
import { getItemKey, requestPost } from '../../../Data'
import { RouteE } from '../../../route'
import { useControllerView } from '../../useControllerView'
import { Team } from './Team'

export function Teams() {
    const { t } = useTranslation()
    const history = useHistory()

    // Toolbar Filters
    const nameToolbarFilter = useNameToolbarFilter()
    const organizationToolbarFilter = useOrganizationToolbarFilter()
    const createdByToolbarFilter = useCreatedByToolbarFilter()
    const modifiedByToolbarFilter = useModifiedByToolbarFilter()
    const toolbarFilters = useMemo<IToolbarFilter[]>(
        () => [nameToolbarFilter, organizationToolbarFilter, createdByToolbarFilter, modifiedByToolbarFilter],
        [nameToolbarFilter, organizationToolbarFilter, createdByToolbarFilter, modifiedByToolbarFilter]
    )

    // Table Columns
    const nameColumn = useNameColumn({ url: RouteE.TeamDetails })
    const organizationColumn = useOrganizationNameColumn()
    const createdColumn = useCreatedColumn()
    const modifiedColumn = useModifiedColumn()
    const tableColumns = useMemo<ITableColumn<Team>[]>(
        () => [nameColumn, organizationColumn, createdColumn, modifiedColumn],
        [createdColumn, modifiedColumn, nameColumn, organizationColumn]
    )

    const view = useControllerView<Team>('/api/v2/teams/', getItemKey, toolbarFilters, tableColumns)

    // Toolbar Actions
    const createToolbarAction = useCreateToolbarAction(RouteE.CreateTeam)
    const deleteToolbarAction = useDeleteTeamToolbarAction(() => void view.refresh())
    const create100TeamsToolbarAction = useCreate100TeamsToolbarAction(() => void view.refresh())
    const toolbarActions = useMemo<IToolbarAction<Team>[]>(
        () => [createToolbarAction, deleteToolbarAction, create100TeamsToolbarAction],
        [create100TeamsToolbarAction, createToolbarAction, deleteToolbarAction]
    )

    // Row Actions
    const editItemAction = useEditItemAction((team: Team) => history.push(RouteE.EditTeam.replace(':id', team.id.toString())))
    const deleteItemAction = useDeleteTeamRowAction(() => void view.refresh())
    const rowActions = useMemo<IItemAction<Team>[]>(() => [editItemAction, deleteItemAction], [deleteItemAction, editItemAction])

    return (
        <TablePage
            title={t('Teams')}
            titleHelpTitle={t('Team')}
            titleHelp="A Team is a subdivision of an organization with associated users, projects, credentials, and permissions. Teams provide a means to implement role-based access control schemes and delegate responsibilities across organizations. For instance, permissions may be granted to a whole Team rather than each user on the Team."
            description="A Team is a subdivision of an organization with associated users, projects, credentials, and permissions."
            toolbarFilters={toolbarFilters}
            toolbarActions={toolbarActions}
            tableColumns={tableColumns}
            rowActions={rowActions}
            {...view}
        />
    )
}

export function useDeleteTeams(callback: () => void) {
    const { t } = useTranslation()
    const [_, setDialog] = useDialog()
    const deleteActionNameColumn = useNameColumn({ disableSort: true })
    const deleteActionOrganizationColumn = useOrganizationNameColumn({ disableLink: true, disableSort: true })
    const deleteActionCreatedColumn = useCreatedColumn({ disableSort: true })
    const deleteActionModifiedColumn = useModifiedColumn({ disableSort: true })
    const deleteTeams = (items: Team[]) => {
        setDialog(
            <BulkActionDialog<Team>
                title={t('Delete teams', { count: items.length })}
                prompt={t('Are you sure you want to delete these {{count}} teams?', { count: items.length })}
                confirm={t('Yes, I confirm that I want to delete these {{count}} teams.', { count: items.length })}
                submit={t('Delete')}
                submitting={t('Deleting')}
                submittingTitle={t('Deleting {{count}} teams', { count: items.length })}
                success={t('Success')}
                cancel={t('Cancel')}
                close={t('Close')}
                error={t('There were errors deleting teams', { count: items.length })}
                items={items.sort((l, r) => compareStrings(l.name, r.name))}
                keyFn={getItemKey}
                isDanger
                columns={[deleteActionNameColumn, deleteActionOrganizationColumn, deleteActionCreatedColumn, deleteActionModifiedColumn]}
                errorColumns={[deleteActionNameColumn, deleteActionOrganizationColumn]}
                onClose={callback}
            />
        )
    }
    return deleteTeams
}

export function useCreate100TeamsToolbarAction(callback: () => void) {
    const { t } = useTranslation()
    const toolbarAction: IToolbarAction<object> = useMemo(
        () => ({
            type: ToolbarActionType.button,
            icon: PlusIcon,
            label: t('Create 100 teams'),
            onClick: () => {
                const promises: Promise<unknown>[] = []
                for (let i = 0; i < 100; i++) {
                    promises.push(
                        requestPost<Team, Partial<Team>>('/api/v2/teams/', {
                            name: randomString(8),
                            organization: 1,
                        }).catch(() => {
                            // do nothing
                        })
                    )
                }
                void Promise.allSettled(promises).then(callback)
            },
        }),
        [callback, t]
    )
    return toolbarAction
}

export function useDeleteTeamToolbarAction(callback: () => void) {
    const deleteTeams = useDeleteTeams(callback)
    return useDeleteToolbarAction(deleteTeams)
}

export function useDeleteTeamRowAction(callback: () => void) {
    const deleteTeams = useDeleteTeams(callback)
    return useDeleteItemAction((item: Team) => deleteTeams([item]))
}
