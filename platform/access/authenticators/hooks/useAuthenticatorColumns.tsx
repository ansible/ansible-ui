import { TFunction } from 'i18next';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ITableColumn, TextCell, useGetPageUrl } from '../../../../framework';
import { useCreatedColumn, useModifiedColumn } from '../../../../frontend/common/columns';
import { Authenticator, AuthenticatorTypeEnum } from '../../../interfaces/Authenticator';
import { PlatformRoute } from '../../../main/PlatformRoutes';

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
  const createdColumn = useCreatedColumn({ sort: 'created_on' });
  const modifiedColumn = useModifiedColumn({ sort: 'modified_on' });
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
