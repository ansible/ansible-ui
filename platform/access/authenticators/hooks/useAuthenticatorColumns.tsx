import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ITableColumn, TextCell, useGetPageUrl } from '../../../../framework';
import { Authenticator } from '../../../interfaces/Authenticator';
import { PlatformRoute } from '../../../PlatformRoutes';
import { useCreatedColumn, useModifiedColumn } from '../../../../frontend/common/columns';

export function useAuthenticatorsColumns() {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const createdColumn = useCreatedColumn({
    sortKey: 'created_on',
    hideByDefaultInTableView: true,
  });
  const modifiedColumn = useModifiedColumn({
    sortKey: 'modified_on',
    hideByDefaultInTableView: true,
  });

  const tableColumns = useMemo<ITableColumn<Authenticator>[]>(
    () => [
      {
        header: t('Order'),
        type: 'count',
        value: (authenticator) => authenticator?.order,
        sort: 'order',
      },
      {
        header: t('Name'),
        cell: (authenticator) => (
          <TextCell
            text={authenticator.name}
            to={getPageUrl(PlatformRoute.AuthenticatorDetails, {
              params: { id: authenticator?.id },
            })}
          />
        ),
        card: 'name',
        list: 'name',
        sort: 'name',
        maxWidth: 200,
      },
      {
        header: t('Authentication type'),
        type: 'text',
        value: (authenticator) => authenticator?.type,
        sort: 'type',
      },
      createdColumn,
      modifiedColumn,
    ],
    [getPageUrl, t]
  );
  return tableColumns;
}
