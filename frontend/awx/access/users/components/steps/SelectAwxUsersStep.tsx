import { SelectUsersStep } from '../../../../../common/access/RolesWizard/steps/SelectUsersStep';
import { useUsersColumns } from '../../hooks/useUsersColumns';
import { useUsersFilters } from '../../hooks/useUsersFilters';
import { useAwxView } from '../../../../common/useAwxView';
import { awxAPI } from '../../../../common/api/awx-utils';
import { User } from '../../../../interfaces/User';

export function AwxSelectUsersStep() {
  const toolbarFilters = useUsersFilters();
  const tableColumns = useUsersColumns();
  const view = useAwxView<User>({
    url: awxAPI`/users`,
    toolbarFilters,
    tableColumns,
  });

  return <SelectUsersStep view={view} tableColumns={tableColumns} />;
}
