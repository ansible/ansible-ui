import { usePageDialog } from '@ansible/ansible-ui-framework';
import { MultiSelectDialog } from '@ansible/ansible-ui-framework/PageDialogs/MultiSelectDialog';
import { useCallback } from 'react';
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
  const [_, setDialog] = usePageDialog();
  const openSelectTeams = useCallback(
    (title: string, onSelect: (teams: Team[]) => void) => {
      setDialog(<SelectTeams title={title} onSelect={onSelect} />);
    },
    [setDialog]
  );
  return openSelectTeams;
}
