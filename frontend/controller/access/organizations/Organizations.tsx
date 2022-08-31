import { useMemo } from 'react'
import { IItemAction, ITableColumn, IToolbarAction, TextCell } from '../../../../framework'
import { useTranslation } from '../../../../framework/components/useTranslation'
import { IToolbarFilter } from '../../../../framework/PageToolbar'
import { TablePage } from '../../../../framework/TablePage'
import { useCreatedColumn, useModifiedColumn, useNameColumn } from '../../../common/columns'
import { compareNumbers } from '../../../common/compare'
import {
    useCreatedByToolbarFilter,
    useDescriptionToolbarFilter,
    useModifiedByToolbarFilter,
    useNameToolbarFilter,
} from '../../../common/controller-toolbar-filters'
import { useDeleteItemAction, useEditItemAction } from '../../../common/item-actions'
import { useCreateToolbarAction, useDeleteToolbarAction } from '../../../common/toolbar-actions'
import { getItemKey } from '../../../Data'
import { RouteE } from '../../../route'
import { useControllerView } from '../../useControllerView'
import { Organization } from './Organization'

export function useOrganizationsFilters() {
    const nameToolbarFilter = useNameToolbarFilter()
    const descriptionToolbarFilter = useDescriptionToolbarFilter()
    const createdByToolbarFilter = useCreatedByToolbarFilter()
    const modifiedByToolbarFilter = useModifiedByToolbarFilter()
    const toolbarFilters = useMemo<IToolbarFilter[]>(
        () => [nameToolbarFilter, descriptionToolbarFilter, createdByToolbarFilter, modifiedByToolbarFilter],
        [nameToolbarFilter, descriptionToolbarFilter, createdByToolbarFilter, modifiedByToolbarFilter]
    )
    return toolbarFilters
}

export function useOrganizationsColumns(onClick?: (organization: Organization) => void) {
    const { t } = useTranslation()
    const nameColumn = useNameColumn(onClick ? { onClick } : { url: RouteE.OrganizationDetails })
    const createdColumn = useCreatedColumn()
    const modifiedColumn = useModifiedColumn()
    const tableColumns = useMemo<ITableColumn<Organization>[]>(
        () => [
            nameColumn,
            {
                header: t('Members'),
                cell: (organization) => <TextCell text={organization.summary_fields.related_field_counts.users.toString()} />,
                sortFn: (l, r) => compareNumbers(l.summary_fields.related_field_counts.users, r.summary_fields.related_field_counts.users),
            },
            {
                header: t('Teams'),
                cell: (organization) => <TextCell text={organization.summary_fields.related_field_counts.teams.toString()} />,
                sortFn: (l, r) => compareNumbers(l.summary_fields.related_field_counts.teams, r.summary_fields.related_field_counts.teams),
            },
            createdColumn,
            modifiedColumn,
        ],
        [createdColumn, modifiedColumn, nameColumn, t]
    )
    return tableColumns
}

export function Organizations() {
    const { t } = useTranslation()

    // Toolbar Filters
    const toolbarFilters = useOrganizationsFilters()

    // Toolbar Actions
    const createToolbarAction = useCreateToolbarAction(RouteE.CreateOrganization)
    const deleteToolbarAction = useDeleteToolbarAction()
    const toolbarActions = useMemo<IToolbarAction<Organization>[]>(
        () => [createToolbarAction, deleteToolbarAction],
        [createToolbarAction, deleteToolbarAction]
    )

    // Table Columns
    const tableColumns = useOrganizationsColumns()

    // Row Actions
    const editItemAction = useEditItemAction()
    const deleteItemAction = useDeleteItemAction()
    const rowActions = useMemo<IItemAction<Organization>[]>(() => [editItemAction, deleteItemAction], [deleteItemAction, editItemAction])

    const view = useControllerView<Organization>('/api/v2/organizations/', getItemKey, toolbarFilters)

    return (
        <TablePage
            title={t('Organizations')}
            description="An Organization is a logical collection of Users, Teams, Projects, and Inventories, and is the highest level in the Tower object hierarchy."
            toolbarFilters={toolbarFilters}
            toolbarActions={toolbarActions}
            tableColumns={tableColumns}
            rowActions={rowActions}
            {...view}
        />
    )
}
