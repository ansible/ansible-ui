import { ButtonVariant, Nav, NavItem, NavList } from '@patternfly/react-core'
import { EditIcon, PlusIcon, TrashIcon } from '@patternfly/react-icons'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { IItemAction, ITableColumn, IToolbarFilter, ITypedAction, TablePage, TextCell, TypedActionType } from '../../../../framework'
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
    const navigate = useNavigate()

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
                onClick: () => navigate(RouteE.CreateOrganization),
            },
            {
                type: TypedActionType.bulk,
                icon: TrashIcon,
                label: t('Delete selected organizations'),
                onClick: deleteOrganizations,
            },
        ],
        [navigate, deleteOrganizations, t]
    )

    const rowActions = useMemo<IItemAction<Organization>[]>(
        () => [
            {
                icon: EditIcon,
                label: t('Edit organization'),
                onClick: (organization) => navigate(RouteE.EditOrganization.replace(':id', organization.id.toString())),
            },
            {
                icon: TrashIcon,
                label: t('Delete organization'),
                onClick: (organization) => deleteOrganizations([organization]),
            },
        ],
        [navigate, deleteOrganizations, t]
    )

    return (
        <TablePage<Organization>
            title={t('Organizations')}
            titleHelpTitle={t('Organizations')}
            titleHelp={t('organizations.title.help')}
            titleDocLink="https://docs.ansible.com/ansible-tower/latest/html/userguide/organizations.html"
            description={t('organizations.title.description')}
            navigation={
                <Nav aria-label="Group section navigation" variant="tertiary">
                    <NavList>
                        <NavItem onClick={() => navigate(RouteE.Organizations)} isActive>
                            {t('Organizations')}
                        </NavItem>
                        <NavItem onClick={() => navigate(RouteE.Teams)}>{t('Teams')}</NavItem>
                        <NavItem onClick={() => navigate(RouteE.Users)}>{t('Users')}</NavItem>
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
            emptyStateButtonClick={() => navigate(RouteE.CreateOrganization)}
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
    const navigate = useNavigate()
    const nameColumn = useNameColumn({
        ...options,
        onClick: (organization) => navigate(RouteE.OrganizationDetails.replace(':id', organization.id.toString())),
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
