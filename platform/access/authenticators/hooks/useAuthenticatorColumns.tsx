import { ITableColumn, TextCell, useGetPageUrl } from '@ansible/ansible-ui-framework';
import { useCreatedColumn, useModifiedColumn } from '@ansible/common-ui/columns';
import { useGet } from '@ansible/common-ui/crud/useGet';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Authenticator } from '../../../interfaces/Authenticator';
import { AuthenticatorPlugins } from '../../../interfaces/AuthenticatorPlugin';
import { PlatformRoute } from '../../../main/PlatformRoutes';
import { gatewayAPI } from '../../../utils/gateway-api-utils';
import { getAuthenticatorTypeLabel } from '../getAuthenticatorTypeLabel';

export function useAuthenticatorsColumns(options?: { disableLinks?: boolean }) {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const { data: plugins } = useGet<AuthenticatorPlugins>(gatewayAPI`/authenticator_plugins/`);
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
            to={
              options?.disableLinks
                ? undefined
                : getPageUrl(PlatformRoute.AuthenticatorDetails, {
                    params: { id: authenticator?.id },
                  })
            }
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
        value: (authenticator) =>
          getAuthenticatorTypeLabel(authenticator.type, t, plugins?.authenticators),
        sort: 'type',
      },
      createdColumn,
      modifiedColumn,
    ],
    [getPageUrl, createdColumn, modifiedColumn, options?.disableLinks, plugins?.authenticators, t]
  );
  return tableColumns;
}
