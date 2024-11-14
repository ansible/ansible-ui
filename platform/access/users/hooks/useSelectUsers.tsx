import { MultiSelectDialog, usePageDialog } from '@ansible/ansible-ui-framework';
import { useCallback } from 'react';
import { usePlatformView } from '../../../hooks/usePlatformView';
import { PlatformUser } from '../../../interfaces/PlatformUser';
import { gatewayAPI } from '../../../utils/gateway-api-utils';
import { useUsersColumns } from './useUserColumns';
import { useUsersFilters } from './useUsersFilters';

function SelectUsers(props: {
  title: string;
  description: string;
  confirmText: string;
  onSelect: (users: PlatformUser[]) => Promise<void>;
}) {
  const toolbarFilters = useUsersFilters();
  const tableColumns = useUsersColumns({ disableLinks: true });
  const view = usePlatformView<PlatformUser>({
    url: gatewayAPI`/users/`,
    queryParams: {
      is_superuser: 'false',
    },
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

export function useSelectUsers() {
  const [_, setDialog] = usePageDialog();
  const openSelectUsers = useCallback(
    (
      title: string,
      description: string,
      confirmText: string,
      onSelect: (users: PlatformUser[]) => Promise<void>
    ) => {
      setDialog(
        <SelectUsers
          title={title}
          description={description}
          confirmText={confirmText}
          onSelect={onSelect}
        />
      );
    },
    [setDialog]
  );
  return openSelectUsers;
}
