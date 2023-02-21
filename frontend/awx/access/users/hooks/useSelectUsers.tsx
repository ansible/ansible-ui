import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { usePageDialog } from '../../../../../framework';
import { SelectMultipleDialog } from '../../../../../framework/useSelectMultipleDialog';
import { User } from '../../../interfaces/User';
<<<<<<< HEAD:frontend/awx/access/users/hooks/useSelectUsers.tsx
import { useAwxView } from '../../../useAwxView';
=======
import { useControllerView } from '../../../useControllerView';
import { useUserAndTeamRolesLists } from '../../common/useUserAndTeamRolesLists';
>>>>>>> a309252 (Remove users from a team in the team list and details page):frontend/controller/access/users/hooks/useSelectUsers.tsx
import { useUsersColumns } from './useUsersColumns';
import { useUsersFilters } from './useUsersFilters';

function SelectUsers(props: {
<<<<<<< HEAD:frontend/awx/access/users/hooks/useSelectUsers.tsx
  title: string;
  onSelect: (users: User[]) => void;
  confirmText?: string;
}) {
  const { t } = useTranslation();
  const toolbarFilters = useUsersFilters();
  const tableColumns = useUsersColumns({ disableLinks: true });
  const view = useAwxView<User>({
    url: '/api/v2/users/',
=======
  accessUrl?: string;
  title: string;
  onSelect: (users: User[]) => void;
}) {
  const toolbarFilters = useUsersFilters();
  const tableColumns = useUsersColumns({ disableLinks: true });
  const view = useControllerView<User>({
    url: props.accessUrl ?? '/api/v2/users/',
>>>>>>> a309252 (Remove users from a team in the team list and details page):frontend/controller/access/users/hooks/useSelectUsers.tsx
    toolbarFilters,
    tableColumns,
    disableQueryString: true,
  });
  useUserAndTeamRolesLists(view.pageItems as User[]);

  return (
    <SelectMultipleDialog
      title={props.title}
      onSelect={props.onSelect}
      toolbarFilters={toolbarFilters}
      tableColumns={tableColumns}
      view={view}
      confirmText={props.confirmText || t('Add user(s)')}
    />
  );
}

export function useSelectUsers() {
  const [_, setDialog] = usePageDialog();
  const openSelectUsers = useCallback(
<<<<<<< HEAD:frontend/awx/access/users/hooks/useSelectUsers.tsx
    (title: string, onSelect: (users: User[]) => void, confirmText?: string) => {
      setDialog(<SelectUsers title={title} onSelect={onSelect} confirmText={confirmText} />);
=======
    (title: string, onSelect: (users: User[]) => void, accessUrl?: string) => {
      setDialog(<SelectUsers accessUrl={accessUrl} title={title} onSelect={onSelect} />);
>>>>>>> a309252 (Remove users from a team in the team list and details page):frontend/controller/access/users/hooks/useSelectUsers.tsx
    },
    [setDialog]
  );
  return openSelectUsers;
}
