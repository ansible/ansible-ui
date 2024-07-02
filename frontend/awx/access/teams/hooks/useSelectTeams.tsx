import { useCallback } from 'react';
import { usePageDialogs } from '../../../../../framework';
import { MultiSelectDialog } from '../../../../../framework/PageDialogs/MultiSelectDialog';
import { awxAPI } from '../../../common/api/awx-utils';
import { useAwxView } from '../../../common/useAwxView';
import { Team } from '../../../interfaces/Team';
import { useTeamsColumns } from './useTeamsColumns';
import { useTeamsFilters } from './useTeamsFilters';

function SelectTeams(props: { title: string; onSelect: (teams: Team[]) => void }) {
  const toolbarFilters = useTeamsFilters();
  const tableColumns = useTeamsColumns({ disableLinks: true });
  const view = useAwxView<Team>({
    url: awxAPI`/teams/`,
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
  const { pushDialog } = usePageDialogs();
  const openSelectTeams = useCallback(
    (title: string, onSelect: (teams: Team[]) => void) => {
      pushDialog(<SelectTeams title={title} onSelect={onSelect} />);
    },
    [pushDialog]
  );
  return openSelectTeams;
}
