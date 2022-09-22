import { ButtonVariant, Nav, NavItem, NavList } from '@patternfly/react-core'
import { EditIcon, PlusIcon, TrashIcon } from '@patternfly/react-icons'
import { useMemo } from 'react'
import { useHistory } from 'react-router-dom'
import {
    IItemAction,
    ITableColumn,
    IToolbarFilter,
    ITypedAction,
    SinceCell,
    TablePage,
    TextCell,
    TypedActionType,
} from '../../../../framework'
import { useTranslation } from '../../../../framework/components/useTranslation'
import {
    useCreatedByToolbarFilter,
    useDescriptionToolbarFilter,
    useModifiedByToolbarFilter,
    useNameToolbarFilter,
} from '../../../common/controller-toolbar-filters'
import { RouteE } from '../../../route'
import { useControllerView } from '../../useControllerView'
import { Organization } from './Organization'

export function Organizations() {
    const { t } = useTranslation()
    const history = useHistory()

    const toolbarFilters = useOrganizationsFilters()

    const tableColumns = useOrganizationsColumns()

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
                onClick: () => alert('TODO'),
            },
        ],
        [history, t]
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
                onClick: () => alert('TODO'),
            },
        ],
        [history, t]
    )

    const view = useControllerView<Organization>('/api/v2/organizations/', toolbarFilters, tableColumns)

    return (
        <TablePage<Organization>
            title={t('Organizations')}
            description="An Organization is a logical collection of Users, Teams, Projects, and Inventories, and is the highest level in the Tower object hierarchy."
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

export function useOrganizationsColumns(disableLinks?: boolean) {
    const { t } = useTranslation()
    const history = useHistory()
    const tableColumns = useMemo<ITableColumn<Organization>[]>(
        () => [
            {
                header: t('Name'),
                cell: (organization) => (
                    <TextCell
                        text={organization.name}
                        to={disableLinks ? undefined : RouteE.OrganizationDetails.replace(':id', organization.id.toString())}
                    />
                ),
                sort: 'name',
            },
            {
                header: t('Description'),
                cell: (organization) => <TextCell text={organization.description} />,
            },
            {
                header: t('Members'),
                cell: (organization) => <TextCell text={organization.summary_fields?.related_field_counts?.users.toString()} />,
            },
            {
                header: t('Teams'),
                cell: (organization) => <TextCell text={organization.summary_fields?.related_field_counts?.teams.toString()} />,
            },
            {
                header: t('Created'),
                cell: (organization: Organization) => (
                    <SinceCell
                        value={organization.created}
                        author={organization.summary_fields?.created_by?.username}
                        onClick={
                            disableLinks
                                ? undefined
                                : () =>
                                      history.push(
                                          RouteE.UserDetails.replace(':id', (organization.summary_fields?.created_by?.id ?? 0).toString())
                                      )
                        }
                    />
                ),
                sort: 'created',
                defaultSortDirection: 'desc',
            },
            {
                header: t('Modified'),
                cell: (organization: Organization) => (
                    <SinceCell
                        value={organization.modified}
                        author={organization.summary_fields?.modified_by?.username}
                        onClick={
                            disableLinks
                                ? undefined
                                : () =>
                                      history.push(
                                          RouteE.UserDetails.replace(':id', (organization.summary_fields?.modified_by?.id ?? 0).toString())
                                      )
                        }
                    />
                ),
                sort: 'modified',
                defaultSortDirection: 'desc',
            },
        ],
        [disableLinks, history, t]
    )
    return tableColumns
}
