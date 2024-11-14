import { ITableColumn, TextCell, useGetPageUrl } from '@ansible/ansible-ui-framework';
import { Token } from '@ansible/awx-ui/interfaces/Token';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useCreatedColumn, useModifiedColumn } from '../../../../frontend/common/columns';
import { PlatformRoute } from '../../../main/PlatformRoutes';

export function useUserTokensColumns(options?: { disableLinks?: boolean; disableSort?: boolean }) {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const createdColumn = useCreatedColumn({
    userDetailsPageId: PlatformRoute.UserDetails,
    ...options,
  });
  const modifiedColumn = useModifiedColumn({
    userDetailsPageId: PlatformRoute.UserDetails,
    ...options,
  });

  return useMemo<ITableColumn<Token>[]>(
    () => [
      {
        header: t('OAuth application name'),
        cell: (token) => (
          <TextCell
            text={
              token.summary_fields?.application?.name
                ? token.summary_fields.application.name
                : t('Personal access token')
            }
            to={
              options?.disableLinks
                ? undefined
                : getPageUrl(PlatformRoute.AAPUserTokenDetails, {
                    params: { id: token.summary_fields.user.id, tokenid: token.id.toString() },
                  })
            }
          />
        ),
        maxWidth: 120,
        defaultSort: true,
        defaultSortDirection: 'asc',
        sort: options?.disableSort ? undefined : 'id',
      },
      {
        header: t('Description'),
        type: 'text',
        value: (token) => token.description,
        sort: options?.disableSort ? undefined : 'description',
      },
      {
        header: t('Scope'),
        type: 'text',
        value: (token) => token.scope,
        sort: options?.disableSort ? undefined : 'scope',
      },
      {
        header: t('Expires'),
        type: 'datetime',
        value: (token) => token.expires,
        sort: options?.disableSort ? undefined : 'expires',
      },
      createdColumn,
      modifiedColumn,
    ],
    [createdColumn, getPageUrl, modifiedColumn, options?.disableLinks, options?.disableSort, t]
  );
}
