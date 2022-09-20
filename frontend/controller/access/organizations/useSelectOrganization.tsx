import { useSelectDialog } from '../../../../framework/useSelectDialog'
import { useControllerView } from '../../useControllerView'
import { useOrganizationsColumns, useOrganizationsFilters } from '../organizations/Organizations'
import { Organization } from './Organization'

export function useSelectOrganization() {
    const toolbarFilters = useOrganizationsFilters()
    const tableColumns = useOrganizationsColumns(true)
    const view = useControllerView<Organization>('/api/v2/organizations/', toolbarFilters, tableColumns)
    return useSelectDialog<Organization>({ toolbarFilters, tableColumns, view })
}
