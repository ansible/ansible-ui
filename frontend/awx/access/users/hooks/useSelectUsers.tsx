import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { usePageDialog } from '../../../../../framework';
import { MultiSelectDialog } from '../../../../../framework/PageDialogs/MultiSelectDialog';
import { User } from '../../../interfaces/User';
import { useAwxView } from '../../../useAwxView';
import { useUserAndTeamRolesLists } from '../../common/useUserAndTeamRolesLists';
import { useUsersColumns } from './useUsersColumns';
import { useUsersFilters } from './useUsersFilters';

function SelectUsers(props: {
  accessUrl?: string;
  title: string;
  onSelect: (users: User[]) => void;
  confirmText?: string;
}) {
  const { t } = useTranslation();
  const toolbarFilters = useUsersFilters();
  const tableColumns = useUsersColumns({ disableLinks: true });
  const view = useAwxView<User>({
    url: props.accessUrl ?? '/api/v2/users/',
    toolbarFilters,
    tableColumns,
    disableQueryString: true,
  });
  useUserAndTeamRolesLists(view.pageItems as User[]);

  return (
    <MultiSelectDialog
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
    (
      title: string,
      onSelect: (users: User[]) => void,
      confirmText?: string,
      accessUrl?: string
    ) => {
      setDialog(
        <SelectUsers
          accessUrl={accessUrl}
          title={title}
          onSelect={onSelect}
          confirmText={confirmText}
        />
      );
    },
    [setDialog]
  );
  return openSelectUsers;
}
