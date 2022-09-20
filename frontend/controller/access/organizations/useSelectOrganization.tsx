import { useSelectDialog } from '../../../../framework/useSelectDialog'
import { useControllerView } from '../../useControllerView'
import { useOrganizationsColumns, useOrganizationsFilters } from '../organizations/Organizations'

export function useSelectOrganization() {
    const toolbarFilters = useOrganizationsFilters()
    const tableColumns = useOrganizationsColumns(true)
    const view = useControllerView('/api/v2/organizations/', toolbarFilters, tableColumns)
    const openSelectDialog = useSelectDialog({ onSelect: () => null, toolbarFilters, tableColumns, view })
    return openSelectDialog
}
