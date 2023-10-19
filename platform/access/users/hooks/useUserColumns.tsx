import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ColumnModalOption,
  ColumnTableOption,
  ITableColumn,
  TextCell,
  useGetPageUrl,
} from '../../../../framework';
import { User } from '../../../interfaces/User';
import { PlatformRoute } from '../../../PlatformRoutes';

export function useUsersColumns() {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();

  const tableColumns = useMemo<ITableColumn<User>[]>(
    () => [
      {
        header: t('Username'),
        cell: (user) => (
          <TextCell
            text={user.username}
            to={getPageUrl(PlatformRoute.UserDetails, { params: { id: user.id } })}
          />
        ),
        card: 'name',
        list: 'name',
        sort: 'username',
        maxWidth: 200,
      },
      {
        header: t('First name'),
        type: 'text',
        value: (user) => user.first_name,
        sort: 'first_name',
      },
      {
        header: t('Last name'),
        type: 'text',
        value: (user) => user.last_name,
        sort: 'last_name',
      },
      //TODO: Column to display teams. Currently not returned in the API.
      {
        header: t('Created'),
        type: 'datetime',
        value: (user) => user.created_on,
        table: ColumnTableOption.Hidden,
        card: 'hidden',
        list: 'hidden',
        modal: ColumnModalOption.Hidden,
      },
      {
        header: t('Last modified'),
        type: 'datetime',
        value: (user) => user.modified_on,
        table: ColumnTableOption.Hidden,
        card: 'hidden',
        list: 'hidden',
        modal: ColumnModalOption.Hidden,
      },
    ],
    [getPageUrl, t]
  );
  return tableColumns;
}
