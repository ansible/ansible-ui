import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ColumnModalOption,
  ColumnTableOption,
  CopyCell,
  ITableColumn,
  TextCell,
  useGetPageUrl,
} from '../../../../framework';
import { EdaEventStream } from '../../interfaces/EdaEventStream';
import { EdaRoute } from '../../main/EdaRoutes';
import { capitalizeFirstLetter } from '../../../../framework/utils/strings';

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
        modal: ColumnModalOption.hidden,
        value: (eventStream) => eventStream?.last_event_received_at ?? undefined,
      },
      {
        header: t('Event stream type'),
        cell: (eventStream) => (
          <TextCell
            text={t(capitalizeFirstLetter(eventStream.event_stream_type ?? ''))}
            to={
              eventStream?.eda_credential?.credential_type_id
                ? getPageUrl(EdaRoute.CredentialTypePage, {
                    params: { id: eventStream?.eda_credential?.credential_type_id },
                  })
                : ''
            }
          />
        ),
        value: (eventStream) => eventStream.event_stream_type,
        modal: ColumnModalOption.hidden,
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
