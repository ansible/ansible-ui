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
        header: t('Events received'),
        type: 'count',
        value: (webhook) => webhook?.events_received ?? 0,
      },
      {
        header: t('Last event received'),
        type: 'datetime',
        value: (webhook) => webhook?.last_event_received_at,
      },
      {
        header: t('Created'),
        type: 'datetime',
        value: (webhook) => webhook.created_at,
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
        value: (webhook) => webhook.modified_at,
        table: ColumnTableOption.expanded,
        card: 'hidden',
        list: 'secondary',
      },
    ],
    [getPageUrl, t]
  );
}
