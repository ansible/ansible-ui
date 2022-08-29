import { useMemo } from 'react'
import { IItemAction, ITableColumn, IToolbarAction } from '../../../../framework'
import { useTranslation } from '../../../../framework/components/useTranslation'
import { IToolbarFilter } from '../../../../framework/PageToolbar'
import { TablePage } from '../../../../framework/TablePage'
import { useCreatedColumn, useModifiedColumn, useNameColumn, useOrganizationNameColumn } from '../../../common/columns'
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
    // TODO const viewDefaults = useQueryStringView({ sort: 'name' })
    const view = useControllerView<Team>('/api/v2/teams/', getItemKey, { sort: 'name' })

    // Toolbar Filters
    const nameToolbarFilter = useNameToolbarFilter()
    const organizationToolbarFilter = useOrganizationToolbarFilter()
    const createdByToolbarFilter = useCreatedByToolbarFilter()
    const modifiedByToolbarFilter = useModifiedByToolbarFilter()
    const toolbarFilters = useMemo<IToolbarFilter[]>(
        () => [nameToolbarFilter, organizationToolbarFilter, createdByToolbarFilter, modifiedByToolbarFilter],
        [nameToolbarFilter, organizationToolbarFilter, createdByToolbarFilter, modifiedByToolbarFilter]
    )

    // Toolbar Actions
    const createToolbarAction = useCreateToolbarAction(RouteE.TeamCreate)
    const deleteToolbarAction = useDeleteToolbarAction()
    const toolbarActions = useMemo<IToolbarAction<Team>[]>(
        () => [createToolbarAction, deleteToolbarAction],
        [createToolbarAction, deleteToolbarAction]
    )

    // Table Columns
    const nameColumn = useNameColumn(RouteE.TeamDetails)
    const organizationColumn = useOrganizationNameColumn()
    const createdColumn = useCreatedColumn()
    const modifiedColumn = useModifiedColumn()
    const tableColumns = useMemo<ITableColumn<Team>[]>(
        () => [nameColumn, organizationColumn, createdColumn, modifiedColumn],
        [createdColumn, modifiedColumn, nameColumn, organizationColumn]
    )

    // Row Actions
    const editItemAction = useEditItemAction()
    const deleteItemAction = useDeleteItemAction()
    const rowActions = useMemo<IItemAction<Team>[]>(() => [editItemAction, deleteItemAction], [deleteItemAction, editItemAction])

    return (
        <TablePage
            breadcrumbs={[{ label: t('Dashboard'), to: RouteE.Dashboard }, { label: t('Teams') }]}
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
