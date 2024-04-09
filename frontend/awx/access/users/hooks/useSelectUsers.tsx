import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { usePageDialog } from '../../../../../framework';
import { MultiSelectDialog } from '../../../../../framework/PageDialogs/MultiSelectDialog';
import { awxAPI } from '../../../common/api/awx-utils';
import { useAwxView } from '../../../common/useAwxView';
import { AwxUser } from '../../../interfaces/User';
import { useUserAndTeamRolesLists } from '../../common/useUserAndTeamRolesLists';
import { useUsersColumns } from './useUsersColumns';
import { useUsersFilters } from './useUsersFilters';

function SelectUsers(props: {
  accessUrl?: string;
  title: string;
  onSelect: (users: AwxUser[]) => void;
  confirmText?: string;
}) {
  const { t } = useTranslation();
  const toolbarFilters = useUsersFilters();
  const tableColumns = useUsersColumns({ disableLinks: true });
  const view = useAwxView<AwxUser>({
    url: props.accessUrl ?? awxAPI`/users/`,
    toolbarFilters,
    tableColumns,
    disableQueryString: true,
  });
  useUserAndTeamRolesLists(view.pageItems as AwxUser[]);

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
      onSelect: (users: AwxUser[]) => void,
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
