import { useCallback } from 'react';
import { usePageDialog } from '../../../../../framework';
import { MultiSelectDialog } from '../../../../../framework/PageDialogs/MultiSelectDialog';
import { Team } from '../../../interfaces/Team';
import { useAwxView } from '../../../useAwxView';
import { useTeamsColumns } from './useTeamsColumns';
import { useTeamsFilters } from './useTeamsFilters';

function SelectTeams(props: { title: string; onSelect: (teams: Team[]) => void }) {
  const toolbarFilters = useTeamsFilters();
  const tableColumns = useTeamsColumns({ disableLinks: true });
  const view = useAwxView<Team>({
    url: '/api/v2/teams/',
    toolbarFilters,
    tableColumns,
    disableQueryString: true,
  });
  return (
    <MultiSelectDialog
      {...props}
      toolbarFilters={toolbarFilters}
      tableColumns={tableColumns}
      view={view}
    />
  );
}

export function useSelectTeams() {
  const [_, setDialog] = usePageDialog();
  const openSelectTeams = useCallback(
    (title: string, onSelect: (teams: Team[]) => void) => {
      setDialog(<SelectTeams title={title} onSelect={onSelect} />);
    },
    [setDialog]
  );
  return openSelectTeams;
}
