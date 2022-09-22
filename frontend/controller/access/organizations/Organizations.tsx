import { ButtonVariant, Nav, NavItem, NavList } from '@patternfly/react-core'
import { EditIcon, PlusIcon, TrashIcon } from '@patternfly/react-icons'
import { useMemo } from 'react'
import { useHistory } from 'react-router-dom'
import { IItemAction, ITableColumn, IToolbarFilter, ITypedAction, TablePage, TextCell, TypedActionType } from '../../../../framework'
import { useTranslation } from '../../../../framework/components/useTranslation'
import { useCreatedColumn, useDescriptionColumn, useModifiedColumn, useNameColumn } from '../../../common/columns'
import {
    useCreatedByToolbarFilter,
    useDescriptionToolbarFilter,
    useModifiedByToolbarFilter,
    useNameToolbarFilter,
} from '../../../common/controller-toolbar-filters'
import { RouteE } from '../../../route'
import { useControllerView } from '../../useControllerView'
import { Organization } from './Organization'
import { useDeleteOrganizations } from './useDeleteOrganizations'

export function Organizations() {
    const { t } = useTranslation()
    const history = useHistory()

    const toolbarFilters = useOrganizationsFilters()

    const tableColumns = useOrganizationsColumns()

    const view = useControllerView<Organization>('/api/v2/organizations/', toolbarFilters, tableColumns)

    const deleteOrganizations = useDeleteOrganizations((deleted: Organization[]) => {
        for (const organization of deleted) {
            view.unselectItem(organization)
        }
        void view.refresh()
    })

    const toolbarActions = useMemo<ITypedAction<Organization>[]>(
        () => [
            {
                type: TypedActionType.button,
                variant: ButtonVariant.primary,
                icon: PlusIcon,
                label: t('Create organization'),
                onClick: () => history.push(RouteE.CreateOrganization),
            },
            {
                type: TypedActionType.bulk,
                icon: TrashIcon,
                label: t('Delete selected organizations'),
                onClick: deleteOrganizations,
            },
        ],
        [history, deleteOrganizations, t]
    )

    const rowActions = useMemo<IItemAction<Organization>[]>(
        () => [
            {
                icon: EditIcon,
                label: t('Edit organization'),
                onClick: (organization) => history.push(RouteE.EditOrganization.replace(':id', organization.id.toString())),
            },
            {
                icon: TrashIcon,
                label: t('Delete organization'),
                onClick: (organization) => deleteOrganizations([organization]),
            },
        ],
        [history, deleteOrganizations, t]
    )

    return (
        <TablePage<Organization>
            title={t('Organizations')}
            titleHelpTitle={t('Organizations')}
            titleHelp={t(
                'An Organization is a logical collection of Users, Teams, Projects, and Inventories, and is the highest level in the Tower object hierarchy.'
            )}
            titleDocLink="https://docs.ansible.com/ansible-tower/latest/html/userguide/organizations.html"
            description={t(
                'An Organization is a logical collection of Users, Teams, Projects, and Inventories, and is the highest level in the Tower object hierarchy.'
            )}
            navigation={
                <Nav aria-label="Group section navigation" variant="tertiary">
                    <NavList>
                        <NavItem onClick={() => history.push(RouteE.Organizations)} isActive>
                            Organizations
                        </NavItem>
                        <NavItem onClick={() => history.push(RouteE.Teams)}>Teams</NavItem>
                        <NavItem onClick={() => history.push(RouteE.Users)}>Users</NavItem>
                    </NavList>
                </Nav>
            }
            toolbarFilters={toolbarFilters}
            toolbarActions={toolbarActions}
            tableColumns={tableColumns}
            rowActions={rowActions}
            errorStateTitle={t('Error loading organizations')}
            emptyStateTitle={t('No organizations yet')}
            emptyStateDescription={t('To get started, create an organization.')}
            emptyStateButtonText={t('Create organization')}
            emptyStateButtonClick={() => history.push(RouteE.CreateOrganization)}
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

export function useOrganizationsColumns(options?: { disableSort?: boolean; disableLinks?: boolean }) {
    const { t } = useTranslation()
    const history = useHistory()
    const nameColumn = useNameColumn({
        ...options,
        onClick: (organization) => history.push(RouteE.OrganizationDetails.replace(':id', organization.id.toString())),
    })
    const descriptionColumn = useDescriptionColumn()
    const createdColumn = useCreatedColumn(options)
    const modifiedColumn = useModifiedColumn(options)
    const tableColumns = useMemo<ITableColumn<Organization>[]>(
        () => [
            nameColumn,
            descriptionColumn,
            {
                header: t('Members'),
                cell: (organization) => <TextCell text={organization.summary_fields?.related_field_counts?.users.toString()} />,
            },
            {
                header: t('Teams'),
                cell: (organization) => <TextCell text={organization.summary_fields?.related_field_counts?.teams.toString()} />,
            },
            createdColumn,
            modifiedColumn,
        ],
        [nameColumn, descriptionColumn, t, createdColumn, modifiedColumn]
    )
    return tableColumns
}
