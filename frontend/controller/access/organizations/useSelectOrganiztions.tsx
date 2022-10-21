import { useCallback } from 'react'
import { usePageDialog } from '../../../../framework'
import { SelectMultipleDialog } from '../../../../framework/useSelectMultipleDialog'
import { useControllerView } from '../../useControllerView'
import { Organization } from './Organization'
import { useOrganizationsColumns, useOrganizationsFilters } from './Organizations'

function SelectOrganizations(props: {
  title: string
  onSelect: (organizations: Organization[]) => void
}) {
  const toolbarFilters = useOrganizationsFilters()
  const tableColumns = useOrganizationsColumns({ disableLinks: true })
  const view = useControllerView<Organization>({
    url: '/api/v2/organizations/',
    toolbarFilters,
    tableColumns,
    disableQueryString: true,
  })
  return (
    <SelectMultipleDialog
      {...props}
      toolbarFilters={toolbarFilters}
      tableColumns={tableColumns}
      view={view}
    />
  )
}

export function useSelectOrganizations() {
  const [_, setDialog] = usePageDialog()
  const openSelectOrganizations = useCallback(
    (title: string, onSelect: (organizations: Organization[]) => void) => {
      setDialog(<SelectOrganizations title={title} onSelect={onSelect} />)
    },
    [setDialog]
  )
  return openSelectOrganizations
}
