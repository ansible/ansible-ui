import { useMemo } from 'react'
import { IItemAction, ITableColumn, IToolbarAction, TextCell } from '../../../../framework'
import { useTranslation } from '../../../../framework/components/useTranslation'
import { IToolbarFilter } from '../../../../framework/PageToolbar'
import { TablePage } from '../../../../framework/TablePage'
import { useCreatedColumn, useModifiedColumn, useNameColumn } from '../../../common/columns'
import { compareNumbers } from '../../../common/compare'
import {
    useCreatedByToolbarFilter,
    useModifiedByToolbarFilter,
    useNameToolbarFilter,
    useOrganizationToolbarFilter,
} from '../../../common/controller-toolbar-filters'
import { useDeleteItemAction, useEditItemAction } from '../../../common/item-actions'
import { useCreateToolbarAction, useDeleteToolbarAction } from '../../../common/toolbar-actions'
import { useControllerView } from '../../../common/useControllerView'
import { getItemKey } from '../../../Data'
import { RouteE } from '../../../route'
import { Organization } from './Organization'

export function Organizations() {
    const { t } = useTranslation()
    const view = useControllerView<Organization>('/api/v2/organizations/', getItemKey)

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
    const createToolbarAction = useCreateToolbarAction(RouteE.CreateOrganization)
    const deleteToolbarAction = useDeleteToolbarAction()
    const toolbarActions = useMemo<IToolbarAction<Organization>[]>(
        () => [createToolbarAction, deleteToolbarAction],
        [createToolbarAction, deleteToolbarAction]
    )

    // Table Columns
    const nameColumn = useNameColumn(RouteE.OrganizationDetails)
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

    // Row Actions
    const editItemAction = useEditItemAction()
    const deleteItemAction = useDeleteItemAction()
    const rowActions = useMemo<IItemAction<Organization>[]>(() => [editItemAction, deleteItemAction], [deleteItemAction, editItemAction])

    return (
        <TablePage
            breadcrumbs={[{ label: t('Dashboard'), to: RouteE.Dashboard }, { label: t('Organizations') }]}
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
