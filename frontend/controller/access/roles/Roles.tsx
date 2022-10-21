import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ITableColumn, IToolbarFilter, TextCell } from '../../../../framework'
import { RouteE } from '../../../Routes'
import { Role } from './Role'

export function useRolesFilters() {
    const { t } = useTranslation()
    const toolbarFilters = useMemo<IToolbarFilter[]>(
        () => [
            {
                key: 'role',
                label: t('Role'),
                type: 'string',
                query: 'role_field__icontains',
            },
        ],
        [t]
    )
    return toolbarFilters
}

export function useRolesColumns() {
    const { t } = useTranslation()

    const tableColumns = useMemo<ITableColumn<Role>[]>(
        () => [
            {
                header: t('Resource name'),
                cell: (role) => (
                    <TextCell
                        text={role.summary_fields.resource_name}
                        to={
                            role.summary_fields.resource_id &&
                            role.summary_fields.resource_type === 'organization'
                                ? RouteE.OrganizationDetails.replace(
                                      ':id',
                                      role.summary_fields.resource_id.toString()
                                  )
                                : undefined
                        }
                    />
                ),
                sort: 'role.summary_fields.resource_name',
            },
            {
                header: t('Resource type'),
                cell: (role) => <TextCell text={role.summary_fields.resource_type_display_name} />,
                sort: 'role.summary_fields.resource_type_display_name',
            },
            {
                header: t('User role'),
                cell: (role) => (
                    <TextCell
                        text={role.name}
                        // to={RouteE.OrganizationDetails.replace(':id', role.summary_fields.resource_id.toString())}
                    />
                ),
                sort: 'name',
            },
        ],
        [t]
    )
    return tableColumns
}
