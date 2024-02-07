import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ITableColumn, TextCell, useGetPageUrl } from '../../../../framework';
import { useCreatedColumn, useModifiedColumn } from '../../../../frontend/common/columns';
import { PlatformUser } from '../../../interfaces/PlatformUser';
import { PlatformRoute } from '../../../main/PlatformRoutes';

export function useUsersColumns() {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const createdColumn = useCreatedColumn({
    sort: 'created_on',
    // hideByDefaultInTableView: true,
  });
  const modifiedColumn = useModifiedColumn({
    sort: 'modified_on',
    // hideByDefaultInTableView: true,
  });

  const tableColumns = useMemo<ITableColumn<PlatformUser>[]>(
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
        defaultSort: true,
      },
      {
        header: t('User type'),
        type: 'text',
        value: (user) => {
          if (user.is_superuser) return t('System adminsitrator');
          if (user.is_system_auditor) return t('System auditor');
          return t('Normal user');
        },
        card: 'subtitle',
        list: 'subtitle',
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
      {
        header: t('Last login'),
        type: 'datetime',
        value: (user) => user.last_login,
        list: 'secondary',
        sort: 'last_login',
      },
      createdColumn,
      modifiedColumn,
    ],
    [createdColumn, getPageUrl, modifiedColumn, t]
  );
  return tableColumns;
}
