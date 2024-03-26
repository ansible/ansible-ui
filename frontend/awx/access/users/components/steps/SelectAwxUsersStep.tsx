import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ITableColumn, TextCell } from '../../../../../../framework';
import { SelectUsersStep } from '../../../../../common/access/RolesWizard/steps/SelectUsersStep';
import { useUsersFilters } from '../../hooks/useUsersFilters';
import { useAwxView } from '../../../../common/useAwxView';
import { awxAPI } from '../../../../common/api/awx-utils';
import { User } from '../../../../interfaces/User';

export function AwxSelectUsersStep() {
  const toolbarFilters = useUsersFilters();
  const { t } = useTranslation();

  const tableColumns: ITableColumn<User>[] = useMemo(() => {
    return [
      {
        header: t('Username'),
        cell: (user: User) => <TextCell text={user.username} />,
        card: 'name',
        list: 'name',
        sort: 'username',
        maxWidth: 200,
      },
      {
        header: t('First name'),
        type: 'text',
        value: (user: User) => user.first_name,
        sort: 'first_name',
      },
      {
        header: t('Last name'),
        type: 'text',
        value: (user: User) => user.last_name,
        sort: 'last_name',
      },
    ];
  }, [t]);

  const view = useAwxView<User>({
    url: awxAPI`/users/`,
    toolbarFilters,
    tableColumns,
  });

  return (
    <SelectUsersStep view={view} tableColumns={tableColumns} toolbarFilters={toolbarFilters} />
  );
}
