import { useTranslation } from 'react-i18next'
import { useSelectDialog } from '../../../../framework'
import { useControllerView } from '../../useControllerView'
import { useOrganizationsColumns, useOrganizationsFilters } from '../organizations/Organizations'
import { Organization } from './Organization'

export function useSelectOrganization() {
    const { t } = useTranslation()
    const toolbarFilters = useOrganizationsFilters()
    const tableColumns = useOrganizationsColumns({ disableLinks: true })
    const view = useControllerView<Organization>('/api/v2/organizations/', toolbarFilters, tableColumns)
    return useSelectDialog<Organization>({
        toolbarFilters,
        tableColumns,
        view,
        confirm: t('Confirm'),
        cancel: t('Cancel'),
        selected: t('Selected'),
    })
}
