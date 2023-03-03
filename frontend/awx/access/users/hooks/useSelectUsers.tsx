import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { usePageDialog } from '../../../../../framework';
import { SelectMultipleDialog } from '../../../../../framework/useSelectMultipleDialog';
import { User } from '../../../interfaces/User';
import { useAwxView } from '../../../useAwxView';
import { useUsersColumns } from './useUsersColumns';
import { useUsersFilters } from './useUsersFilters';

function SelectUsers(props: {
  title: string;
  onSelect: (users: User[]) => void;
  confirmText?: string;
}) {
  const { t } = useTranslation();
  const toolbarFilters = useUsersFilters();
  const tableColumns = useUsersColumns({ disableLinks: true });
  const view = useAwxView<User>({
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
      confirmText={props.confirmText || t('Add user(s)')}
    />
  );
}

export function useSelectUsers() {
  const [_, setDialog] = usePageDialog();
  const openSelectUsers = useCallback(
    (title: string, onSelect: (users: User[]) => void, confirmText?: string) => {
      setDialog(<SelectUsers title={title} onSelect={onSelect} confirmText={confirmText} />);
    },
    [setDialog]
  );
  return openSelectUsers;
}
