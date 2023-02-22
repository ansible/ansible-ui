import { useCallback } from 'react';
import { usePageDialog } from '../../../../../framework';
import { SelectMultipleDialog } from '../../../../../framework/useSelectMultipleDialog';
import { User } from '../../../interfaces/User';
import { useControllerView } from '../../../useAwxView';
import { useUsersColumns } from './useUsersColumns';
import { useUsersFilters } from './useUsersFilters';

function SelectUsers(props: { title: string; onSelect: (users: User[]) => void }) {
  const toolbarFilters = useUsersFilters();
  const tableColumns = useUsersColumns({ disableLinks: true });
  const view = useControllerView<User>({
    url: '/api/v2/users/',
    toolbarFilters,
    tableColumns,
    disableQueryString: true,
  });
  return (
    <SelectMultipleDialog
      {...props}
      toolbarFilters={toolbarFilters}
      tableColumns={tableColumns}
      view={view}
    />
  );
}

export function useSelectUsers() {
  const [_, setDialog] = usePageDialog();
  const openSelectUsers = useCallback(
    (title: string, onSelect: (users: User[]) => void) => {
      setDialog(<SelectUsers title={title} onSelect={onSelect} />);
    },
    [setDialog]
  );
  return openSelectUsers;
}
