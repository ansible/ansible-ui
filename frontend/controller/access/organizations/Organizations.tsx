import { Button, Split } from '@patternfly/react-core'
import { useMemo } from 'react'
import { useHistory } from 'react-router-dom'
import { IItemAction, ITableColumn, IToolbarFilter, ITypedAction, SinceCell, TablePage, TextCell } from '../../../../framework'
import { useTranslation } from '../../../../framework/components/useTranslation'
import { compareNumbers } from '../../../../framework/utils/compare'
import { useNameColumn } from '../../../common/columns'
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

export function Organizations() {
    const { t } = useTranslation()

    // Toolbar Filters
    const toolbarFilters = useOrganizationsFilters()

    // Toolbar Actions
    const createToolbarAction = useCreateToolbarAction(RouteE.CreateOrganization)
    const deleteToolbarAction = useDeleteToolbarAction(() => {
        // TODO
    })
    const toolbarActions = useMemo<ITypedAction<Organization>[]>(
        () => [createToolbarAction, deleteToolbarAction],
        [createToolbarAction, deleteToolbarAction]
    )

    // Table Columns
    const tableColumns = useOrganizationsColumns()

    // Row Actions
    const editItemAction = useEditItemAction(() => {
        // TODO
    })
    const deleteItemAction = useDeleteItemAction(() => {
        // TODO
    })
    const rowActions = useMemo<IItemAction<Organization>[]>(() => [editItemAction, deleteItemAction], [deleteItemAction, editItemAction])

    const view = useControllerView<Organization>('/api/v2/organizations/', getItemKey, toolbarFilters)

    return (
        <TablePage<Organization>
            title={t('Organizations')}
            description="An Organization is a logical collection of Users, Teams, Projects, and Inventories, and is the highest level in the Tower object hierarchy."
            toolbarFilters={toolbarFilters}
            toolbarActions={toolbarActions}
            tableColumns={tableColumns}
            rowActions={rowActions}
            errorStateTitle={t('Error loading organizations')}
            emptyStateTitle={t('No organizations yet')}
            emptyStateDescription={t('To get started, create an organization.')}
            emptyStateButtonText={t('Create organization')}
            // emptyStateButtonClick={() => history.push(RouteE.CreateUser)}
            {...view}
        />
    )
}

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
    const history = useHistory()
    const tableColumns = useMemo<ITableColumn<Organization>[]>(
        () => [
            nameColumn,
            {
                header: t('Members'),
                cell: (organization) => <TextCell text={organization.summary_fields?.related_field_counts?.users.toString()} />,
                sortFn: (l, r) =>
                    compareNumbers(l.summary_fields?.related_field_counts?.users, r.summary_fields?.related_field_counts?.users),
            },
            {
                header: t('Teams'),
                cell: (organization) => <TextCell text={organization.summary_fields?.related_field_counts?.teams.toString()} />,
                sortFn: (l, r) =>
                    compareNumbers(l.summary_fields?.related_field_counts?.teams, r.summary_fields?.related_field_counts?.teams),
            },
            {
                header: t('Created'),
                cell: (organization: Organization) => (
                    <Split>
                        <SinceCell value={organization.created} /> by&nbsp;
                        <Button
                            variant="link"
                            isInline
                            onClick={() =>
                                history.push(
                                    RouteE.UserDetails.replace(':id', (organization.summary_fields?.created_by?.id ?? 0).toString())
                                )
                            }
                        >
                            {organization.summary_fields?.created_by?.username}
                        </Button>
                    </Split>
                ),
                sort: 'created',
                defaultSortDirection: 'desc',
            },
            {
                header: t('Modified'),
                cell: (organization: Organization) => (
                    <Split>
                        <SinceCell value={organization.modified} /> by&nbsp;
                        <Button
                            variant="link"
                            isInline
                            onClick={() =>
                                history.push(
                                    RouteE.UserDetails.replace(':id', (organization.summary_fields?.modified_by?.id ?? 0).toString())
                                )
                            }
                        >
                            {organization.summary_fields?.modified_by?.username}
                        </Button>
                    </Split>
                ),
                sort: 'modified',
                defaultSortDirection: 'desc',
            },
        ],
        [nameColumn, t]
    )
    return tableColumns
}
