import { useCallback } from 'react'
import { usePageDialog } from '../../../../../framework'
import { SelectMultipleDialog } from '../../../../../framework/useSelectMultipleDialog'
import { Team } from '../../../interfaces/Team'
import { useControllerView } from '../../../useControllerView'
import { useTeamsColumns, useTeamsFilters } from '../Teams'

function SelectTeams(props: { title: string; onSelect: (teams: Team[]) => void }) {
  const toolbarFilters = useTeamsFilters()
  const tableColumns = useTeamsColumns({ disableLinks: true })
  const view = useControllerView<Team>({
    url: '/api/v2/teams/',
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

export function useSelectTeams() {
  const [_, setDialog] = usePageDialog()
  const openSelectTeams = useCallback(
    (title: string, onSelect: (teams: Team[]) => void) => {
      setDialog(<SelectTeams title={title} onSelect={onSelect} />)
    },
    [setDialog]
  )
  return openSelectTeams
}
