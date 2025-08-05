import { ITableColumn, TextCell, useGetPageUrl } from '@ansible/ansible-ui-framework';
import { Token } from '@ansible/awx-ui/interfaces/Token';
import { AwxRoute } from '@ansible/awx-ui/main/AwxRoutes';
import { useCreatedColumn, useModifiedColumn } from '@ansible/common-ui/columns';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
import { PlatformRoute } from '../../../../main/PlatformRoutes';

export function useLegacyTokenColumns(options?: { disableLinks?: boolean; disableSort?: boolean }) {
  const { t } = useTranslation();
  const { id: userId } = useParams<{ id?: string }>();
  const getPageUrl = useGetPageUrl();
  const createdColumn = useCreatedColumn({
    userDetailsPageId: AwxRoute.UserDetails,
    ...options,
  });
  const modifiedColumn = useModifiedColumn({
    userDetailsPageId: AwxRoute.UserDetails,
    ...options,
  });

  return useMemo<ITableColumn<Token>[]>(
    () => [
      {
        header: t('Description'),
        value: (token) => token.description,
        sort: options?.disableSort ? undefined : 'description',
        defaultSort: true,
        cell: (token) => (
          <TextCell
            text={
              token.description
                ? token.description
                : token.summary_fields?.application?.name
                  ? token.summary_fields.application.name
                  : t('Personal Access Token')
            }
            to={
              options?.disableLinks
                ? undefined
                : userId !== undefined
                  ? getPageUrl(PlatformRoute.UserLegacyTokenDetails, {
                      params: { id: token.summary_fields.user?.id, tokenid: token.id.toString() },
                    })
                  : getPageUrl(PlatformRoute.LegacyTokenPage, {
                      params: { tokenid: token.id.toString() },
                    })
            }
            maxWidth={300}
          />
        ),
      },
      {
        header: t('User'),
        value: (token) => token.summary_fields?.user?.username,
        cell: (token) => (
          <TextCell
            text={token.summary_fields?.user?.username ?? t('Unknown user')}
            to={
              options?.disableLinks
                ? undefined
                : getPageUrl(AwxRoute.UserDetails, {
                    params: { id: token.summary_fields.user?.id.toString() },
                  })
            }
          />
        ),
      },
      {
        header: t('Scope'),
        type: 'labels',
        value: (token) => {
          switch (token.scope) {
            case 'read':
              return [t('Read')];
            case 'write':
              return [t('Write')];
            default:
              return [token.scope];
          }
        },
        sort: options?.disableSort ? undefined : 'scope',
      },
      {
        header: t('Legacy application'),
        cell: (token) => (
          <TextCell
            text={token.summary_fields?.application?.name}
            to={
              options?.disableLinks
                ? undefined
                : getPageUrl(PlatformRoute.LegacyApplicationDetails, {
                    params: { applicationId: token.summary_fields.application?.id.toString() },
                  })
            }
          />
        ),
        value: (token) => token.summary_fields?.application?.name,
        maxWidth: 120,
      },
      {
        header: t('Last used'),
        type: 'datetime',
        value: (token) => token.last_used ?? undefined,
        sort: options?.disableSort ? undefined : 'last_used',
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
    [
      createdColumn,
      getPageUrl,
      modifiedColumn,
      options?.disableLinks,
      options?.disableSort,
      t,
      userId,
    ]
  );
}
