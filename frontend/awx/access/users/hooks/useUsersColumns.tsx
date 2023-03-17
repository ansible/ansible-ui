import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ITableColumn, DateTimeCell, TextCell } from '../../../../../framework';
import { RouteObj } from '../../../../Routes';
import { User } from '../../../interfaces/User';
import { UserType } from '../components/UserType';

export function useUsersColumns(_options?: { disableLinks?: boolean; disableSort?: boolean }) {
  const { t } = useTranslation();
  const tableColumns = useMemo<ITableColumn<User>[]>(
    () => [
      {
        header: t('Username'),
        cell: (user) => (
          <TextCell
            text={user.username}
            to={RouteObj.UserDetails.replace(':id', user.id.toString())}
          />
        ),
        card: 'name',
        list: 'name',
        sort: 'username',
        maxWidth: 200,
        showOnModal: true,
      },
      {
        header: t('User type'),
        cell: (user) => <UserType user={user} />,
        card: 'subtitle',
        list: 'subtitle',
        showOnModal: true,
      },
      {
        header: t('First name'),
        type: 'text',
        value: (user) => user.first_name,
        sort: 'first_name',
        showOnModal: true,
      },
      {
        header: t('Last name'),
        type: 'text',
        value: (user) => user.last_name,
        sort: 'last_name',
        showOnModal: true,
      },
      {
        header: t('Email'),
        type: 'text',
        value: (user) => user.email,
        sort: 'email',
      },
      {
        header: t('Created'),
        cell: (item) => <DateTimeCell format="since" value={item.created} />,
        card: 'hidden',
        list: 'secondary',
      },
    ],
    [t]
  );
  return tableColumns;
}
