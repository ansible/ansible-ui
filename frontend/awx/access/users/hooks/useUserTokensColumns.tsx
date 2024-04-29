import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ITableColumn, TextCell, useGetPageUrl } from '../../../../../framework';
import { AwxUser } from '../../../interfaces/User';
import { Token } from '../../../interfaces/Token';
import { AwxRoute } from '../../../main/AwxRoutes';
import { useCreatedColumn, useModifiedColumn } from '../../../../common/columns';

export function useUserTokensColumns(
  user: AwxUser,
  options?: {
    disableLinks?: boolean;
  }
) {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const createdColumn = useCreatedColumn();
  const modifiedColumn = useModifiedColumn();

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
            to={
              options?.disableLinks
                ? undefined
                : getPageUrl(AwxRoute.UserTokenDetails, {
                    params: { id: user.id, tokenid: token.id.toString() },
                  })
            }
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
      createdColumn,
      modifiedColumn,
    ],
    [createdColumn, getPageUrl, modifiedColumn, options?.disableLinks, t, user.id]
  );
}
