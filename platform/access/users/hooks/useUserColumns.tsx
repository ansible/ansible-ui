import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ColumnModalOption, ITableColumn, TextCell, useGetPageUrl } from '../../../../framework';
import { useCreatedColumn, useModifiedColumn } from '../../../../frontend/common/columns';
import { PlatformUser } from '../../../interfaces/PlatformUser';
import { PlatformRoute } from '../../../main/PlatformRoutes';

export function useUsersColumns(options?: { disableLinks?: boolean }) {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const createdColumn = useCreatedColumn({
    sort: 'created_on',
  });
  const modifiedColumn = useModifiedColumn({
    sort: 'modified_on',
  });

  const tableColumns = useMemo<ITableColumn<PlatformUser>[]>(
    () => [
      {
        header: t('Username'),
        cell: (user) => (
          <TextCell
            text={user.username}
            to={
              options?.disableLinks
                ? undefined
                : getPageUrl(PlatformRoute.UserDetails, { params: { id: user.id } })
            }
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
          if (user.is_superuser) return t('System administrator');
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
        modal: ColumnModalOption.hidden,
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
        modal: ColumnModalOption.hidden,
      },
      createdColumn,
      modifiedColumn,
    ],
    [createdColumn, getPageUrl, modifiedColumn, options?.disableLinks, t]
  );
  return tableColumns;
}
