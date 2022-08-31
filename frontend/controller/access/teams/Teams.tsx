import { useCallback, useMemo } from 'react'
import { IItemAction, ITableColumn, IToolbarAction } from '../../../../framework'
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
import { useCreateToolbarAction, useDeleteToolbarAction } from '../../../common/toolbar-actions'
import { getItemKey } from '../../../Data'
import { RouteE } from '../../../route'
import { useControllerView } from '../../useControllerView'
import { Team } from './Team'

export function Teams() {
    const { t } = useTranslation()
    const [_, setDialog] = useDialog()

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
    const createToolbarAction = useCreateToolbarAction(RouteE.TeamCreate)
    const deleteToolbarAction = useDeleteTeamToolbarAction()
    const toolbarActions = useMemo<IToolbarAction<Team>[]>(
        () => [createToolbarAction, deleteToolbarAction],
        [createToolbarAction, deleteToolbarAction]
    )

    // Row Actions
    const editItemAction = useEditItemAction()
    const deleteItemAction = useDeleteItemAction()
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

export function useDeleteTeamToolbarAction() {
    const { t } = useTranslation()
    const [_, setDialog] = useDialog()
    const deleteActionNameColumn = useNameColumn({ disableSort: true })
    const deleteActionOrganizationColumn = useOrganizationNameColumn({ disableLink: true, disableSort: true })
    const deleteActionCreatedColumn = useCreatedColumn({ disableSort: true })
    const deleteActionModifiedColumn = useModifiedColumn({ disableSort: true })
    const handleDelete = useCallback(
        (items: Team[]) => {
            setDialog(
                <BulkActionDialog<Team>
                    title={t('Delete teams')}
                    prompt={t('Are you sure you want to delete these teams?')}
                    confirm={t('Yes, I confirm that I want to delete these teams.')}
                    submit={t('Delete')}
                    submitting={t('Deleting')}
                    submittingTitle={t('Deleting teams')}
                    success={t('Success')}
                    cancel={t('Cancel')}
                    close={t('Close')}
                    error={t('There were errors deleting teams')}
                    items={items.sort((l, r) => compareStrings(l.name, r.name))}
                    keyFn={getItemKey}
                    isDanger
                    columns={[
                        deleteActionNameColumn,
                        deleteActionOrganizationColumn,
                        deleteActionCreatedColumn,
                        deleteActionModifiedColumn,
                    ]}
                    errorColumns={[deleteActionNameColumn, deleteActionOrganizationColumn]}
                />
            )
        },
        [setDialog, t, deleteActionNameColumn, deleteActionOrganizationColumn, deleteActionCreatedColumn, deleteActionModifiedColumn]
    )
    const deleteToolbarAction = useDeleteToolbarAction(handleDelete)
    return deleteToolbarAction
}
