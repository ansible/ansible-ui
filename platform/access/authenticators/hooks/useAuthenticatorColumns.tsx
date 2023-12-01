import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ITableColumn, TextCell, useGetPageUrl } from '../../../../framework';
import { Authenticator, AuthenticatorTypeEnum } from '../../../interfaces/Authenticator';
import { PlatformRoute } from '../../../PlatformRoutes';
import { useCreatedColumn, useModifiedColumn } from '../../../../frontend/common/columns';
import { TFunction } from 'i18next';

export function authenticatorTypeLabel(type: AuthenticatorTypeEnum, t: TFunction<'translation'>) {
  switch (type) {
    case AuthenticatorTypeEnum.LDAP:
      return t('LDAP');
    case AuthenticatorTypeEnum.Local:
      return t('Local');
    case AuthenticatorTypeEnum.Keycloak:
      return t('Keycloak');
    case AuthenticatorTypeEnum.SAML:
      return t('SAML');
    default:
      return type;
  }
}

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
        value: (authenticator) => authenticatorTypeLabel(authenticator.type, t),
        sort: 'type',
      },
      createdColumn,
      modifiedColumn,
    ],
    [getPageUrl, createdColumn, modifiedColumn, t]
  );
  return tableColumns;
}
