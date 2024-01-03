import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ITableColumn, TextCell, useGetPageUrl } from '../../../../framework';
import {
  useCreatedColumn,
  useIdColumn,
  useModifiedColumn,
} from '../../../../frontend/common/columns';
import { PlatformRoute } from '../../../PlatformRoutes';
import { PlatformUser } from '../../../interfaces/PlatformUser';

export function useUsersColumns() {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const idColumn = useIdColumn();
  const createdColumn = useCreatedColumn({
    sortKey: 'created_on',
    // hideByDefaultInTableView: true,
  });
  const modifiedColumn = useModifiedColumn({
    sortKey: 'modified_on',
    // hideByDefaultInTableView: true,
  });

  const tableColumns = useMemo<ITableColumn<PlatformUser>[]>(
    () => [
      idColumn,
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
        header: t('Email'),
        type: 'text',
        value: (user) => user.email,
        sort: 'email',
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
      createdColumn,
      modifiedColumn,
    ],
    [idColumn, createdColumn, getPageUrl, modifiedColumn, t]
  );
  return tableColumns;
}
