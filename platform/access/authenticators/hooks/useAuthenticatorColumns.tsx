import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ITableColumn, TextCell, useGetPageUrl } from '../../../../framework';
import { useCreatedColumn, useModifiedColumn } from '../../../../frontend/common/columns';
import { getAuthenticatorTypeLabel } from '../getAuthenticatorTypeLabel';
import { Authenticator } from '../../../interfaces/Authenticator';
import { PlatformRoute } from '../../../main/PlatformRoutes';

export function useAuthenticatorsColumns() {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const createdColumn = useCreatedColumn({
    sort: 'created',
    userDetailsPageId: PlatformRoute.UserDetails,
  });
  const modifiedColumn = useModifiedColumn({
    sort: 'modified',
    userDetailsPageId: PlatformRoute.UserDetails,
  });
  const tableColumns = useMemo<ITableColumn<Authenticator>[]>(
    () => [
      {
        header: t('Order'),
        type: 'count',
        value: (authenticator) => authenticator?.order,
        sort: 'order',
        defaultSort: true,
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
        value: (authenticator) => getAuthenticatorTypeLabel(authenticator.type, t),
        sort: 'type',
      },
      createdColumn,
      modifiedColumn,
    ],
    [getPageUrl, createdColumn, modifiedColumn, t]
  );
  return tableColumns;
}
