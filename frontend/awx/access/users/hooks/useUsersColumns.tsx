import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ITableColumn, TextCell, useGetPageUrl } from '../../../../../framework';
import { useCreatedColumn } from '../../../../common/columns';
import { AwxUser } from '../../../interfaces/User';
import { AwxRoute } from '../../../main/AwxRoutes';
import { UserType } from '../components/UserType';

export function useUsersColumns(options?: { disableLinks?: boolean; disableSort?: boolean }) {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const disableLinks = options?.disableLinks || false;

  const createdColumn = useCreatedColumn(options);
  const tableColumns = useMemo<ITableColumn<AwxUser>[]>(
    () => [
      {
        header: t('Username'),
        cell: (user) => (
          <TextCell
            text={user.username}
            to={
              disableLinks
                ? undefined
                : getPageUrl(AwxRoute.UserDetails, { params: { id: user.id.toString() } })
            }
          />
        ),
        card: 'name',
        list: 'name',
        sort: 'username',
        maxWidth: 200,
      },
      {
        header: t('User type'),
        cell: (user) => <UserType user={user} />,
        card: 'subtitle',
        list: 'subtitle',
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
      {
        header: t('Email'),
        type: 'text',
        value: (user) => user.email,
        sort: 'email',
      },
      {
        ...createdColumn,
        sort: undefined,
      },
    ],
    [createdColumn, getPageUrl, t, disableLinks]
  );
  return tableColumns;
}
