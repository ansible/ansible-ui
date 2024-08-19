import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ColumnTableOption,
  CopyCell,
  ITableColumn,
  TextCell,
  useGetPageUrl,
} from '../../../../framework';
import { EdaEventStream } from '../../interfaces/EdaEventStream';
import { EdaRoute } from '../../main/EdaRoutes';
import { ConnectedIcon, DisconnectedIcon } from '@patternfly/react-icons';
import { Tooltip } from '@patternfly/react-core';

export function useEventStreamColumns() {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  return useMemo<ITableColumn<EdaEventStream>[]>(
    () => [
      {
        header: t('Name'),
        cell: (eventStream) => (
          <TextCell
            text={eventStream.name}
            to={getPageUrl(EdaRoute.EventStreamPage, {
              params: { id: eventStream.id },
            })}
          />
        ),
        card: 'name',
        list: 'name',
      },
      {
        header: t('Events received'),
        type: 'count',
        value: (eventStream) => eventStream?.events_received ?? 0,
      },
      {
        header: t('Last event received'),
        type: 'datetime',
        value: (eventStream) => eventStream?.last_event_received_at ?? undefined,
      },
      {
        header: t('Mode'),
        cell: (eventStream) => (
          <Tooltip
            content={
              eventStream.test_mode
                ? t('Test Mode - events are not forwarded to Activation')
                : t('Connected - events are forwarded to Activation')
            }
          >
            <TextCell
              text={t('')}
              icon={eventStream.test_mode ? <DisconnectedIcon /> : <ConnectedIcon />}
              iconColor={eventStream.test_mode ? 'yellow' : 'green'}
            />
          </Tooltip>
        ),
        card: 'name',
        list: 'name',
      },
      {
        header: t('URL'),
        cell: (eventStream) => <CopyCell text={eventStream?.url ? eventStream.url : ''} />,
        table: ColumnTableOption.expanded,
        card: 'hidden',
        list: 'secondary',
      },
      {
        header: t('Created'),
        type: 'datetime',
        value: (eventStream) => eventStream.created_at,
        table: ColumnTableOption.expanded,
        card: 'hidden',
        list: 'secondary',
      },
      {
        header: t('Last modified'),
        type: 'datetime',
        value: (eventStream) => eventStream.modified_at,
        table: ColumnTableOption.expanded,
        card: 'hidden',
        list: 'secondary',
      },
    ],
    [getPageUrl, t]
  );
}
