import { useTranslation } from 'react-i18next';
import { useUserFilters } from '../hooks/useUserFilters';
import { useMemo } from 'react';
import { EdaUser } from '../../../interfaces/EdaUser';
import { ITableColumn, TextCell } from '../../../../../framework';
import { useEdaView } from '../../../common/useEventDrivenView';
import { edaAPI } from '../../../common/eda-utils';
import { SelectUsersStep } from '../../../../common/access/RolesWizard/steps/SelectUsersStep';

export function EdaSelectUsersStep() {
  const toolbarFilters = useUserFilters();
  const { t } = useTranslation();

  const tableColumns: ITableColumn<EdaUser>[] = useMemo(() => {
    return [
      {
        header: t('Username'),
        cell: (user: EdaUser) => <TextCell text={user.username} />,
        card: 'name',
        list: 'name',
        sort: 'username',
        maxWidth: 200,
      },
      {
        header: t('First name'),
        type: 'text',
        value: (user: EdaUser) => user.first_name,
        sort: 'first_name',
      },
      {
        header: t('Last name'),
        type: 'text',
        value: (user: EdaUser) => user.last_name,
        sort: 'last_name',
      },
    ];
  }, [t]);

  const view = useEdaView<EdaUser>({
    url: edaAPI`/users/`,
    toolbarFilters,
    tableColumns,
  });

  return (
    <SelectUsersStep view={view} tableColumns={tableColumns} toolbarFilters={toolbarFilters} />
  );
}
