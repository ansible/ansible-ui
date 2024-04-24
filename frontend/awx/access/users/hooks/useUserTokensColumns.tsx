import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ITableColumn, TextCell, useGetPageUrl } from '../../../../../framework';
import { Token } from '../../../interfaces/Token';
import { AwxRoute } from '../../../main/AwxRoutes';

export function useUserTokensColumns(userId: number) {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();

  return useMemo<ITableColumn<Token>[]>(
    () => [
      {
        header: t('Application name'),
        cell: (token) => (
          <TextCell
            text={
              token.summary_fields?.application?.name
                ? token.summary_fields.application.name
                : t('Personal access token')
            }
            to={getPageUrl(AwxRoute.UserTokenDetails, {
              params: { id: userId, tokenid: token.id.toString() },
            })}
          />
        ),
        maxWidth: 120,
        defaultSort: true,
        defaultSortDirection: 'asc',
        sort: 'id',
      },
      {
        header: t('Description'),
        type: 'text',
        value: (token) => token.description,
        sort: 'description',
      },
      {
        header: t('Scope'),
        type: 'text',
        value: (token) => token.scope,
        sort: 'scope',
      },
      {
        header: t('Expires'),
        type: 'datetime',
        value: (token) => token.expires,
        sort: 'expires',
      },
    ],
    [getPageUrl, t, userId]
  );
}
