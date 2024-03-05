import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ColumnTableOption, ITableColumn, TextCell, useGetPageUrl } from '../../../../framework';
import { EdaWebhook } from '../../interfaces/EdaWebhook';
import { EdaRoute } from '../../main/EdaRoutes';

export function useWebhookColumns() {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  return useMemo<ITableColumn<EdaWebhook>[]>(
    () => [
      {
        header: t('Name'),
        cell: (webhook) => (
          <TextCell
            text={webhook.name}
            to={getPageUrl(EdaRoute.WebhookPage, {
              params: { id: webhook.id },
            })}
          />
        ),
        card: 'name',
        list: 'name',
      },
      {
        header: t('Created'),
        type: 'datetime',
        value: (instance) => instance.created_at,
      },
      {
        header: t('URL'),
        type: 'description',
        value: (webhook) => webhook.url,
        table: ColumnTableOption.expanded,
        card: 'hidden',
        list: 'secondary',
      },
      {
        header: t('Last modified'),
        type: 'datetime',
        value: (instance) => instance.modified_at,
        table: ColumnTableOption.expanded,
        card: 'hidden',
        list: 'secondary',
      },
    ],
    [getPageUrl, t]
  );
}
