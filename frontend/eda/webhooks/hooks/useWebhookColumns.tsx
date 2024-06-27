import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ColumnTableOption,
  CopyCell,
  ITableColumn,
  TextCell,
  useGetPageUrl,
} from '../../../../framework';
import { EdaWebhook } from '../../interfaces/EdaWebhook';
import { EdaRoute } from '../../main/EdaRoutes';
import { ConnectedIcon, DisconnectedIcon } from '@patternfly/react-icons';
import { Tooltip } from '@patternfly/react-core';

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
        header: t('Mode'),
        cell: (webhook) => (
          <Tooltip
            content={
              webhook.test_mode
                ? t('Test Mode - events are not forwarded to Activation')
                : t('Connected - events are forwarded to Activation')
            }
          >
            <TextCell
              text={t('')}
              icon={webhook.test_mode ? <DisconnectedIcon /> : <ConnectedIcon />}
              iconColor={webhook.test_mode ? 'yellow' : 'green'}
            />
          </Tooltip>
        ),
        card: 'name',
        list: 'name',
      },
      {
        header: t('URL'),
        cell: (webhook) => <CopyCell text={webhook?.url ? webhook.url : ''} />,
        table: ColumnTableOption.expanded,
        card: 'hidden',
        list: 'secondary',
      },
      {
        header: t('Created'),
        type: 'datetime',
        value: (webhook) => webhook.created_at,
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
