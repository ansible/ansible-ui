import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ColumnTableOption, ITableColumn, TextCell, useGetPageUrl } from '../../../../framework';
import { StatusCell } from '../../../common/Status';
import { EdaEventStream } from '../../interfaces/EdaEventStream';
import { Status906Enum } from '../../interfaces/generated/eda-api';
import { EdaRoute } from '../../main/EdaRoutes';
import { Label } from '@patternfly/react-core';
import { InfoCircleIcon } from '@patternfly/react-icons';

export function useEventStreamColumns() {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  return useMemo<ITableColumn<EdaEventStream>[]>(
    () => [
      {
        header: t('ID'),
        type: 'text',
        value: (eventStream) => eventStream.id.toString(),
        modal: 'hidden',
        dashboard: 'hidden',
      },
      {
        header: t('Name'),
        cell: (eventStream) =>
          eventStream?.status !== Status906Enum.Deleting ? (
            <TextCell
              text={eventStream.name}
              to={getPageUrl(EdaRoute.EventStreamPage, {
                params: { id: eventStream.id },
              })}
            />
          ) : (
            <TextCell text={eventStream.name} />
          ),
        card: 'name',
        list: 'name',
      },
      {
        header: t('Description'),
        type: 'description',
        value: (eventStream) => eventStream.description,
        table: ColumnTableOption.description,
        card: 'description',
        list: 'description',
        modal: 'hidden',
        dashboard: 'hidden',
      },
      {
        header: t('Source type'),
        type: 'description',
        value: (eventStream) => eventStream.source_type,
        modal: 'hidden',
        dashboard: 'hidden',
      },
      {
        header: t('Status'),
        cell: (eventStream) =>
          eventStream?.status === Status906Enum.Deleting ? (
            <Label color="red" icon={<InfoCircleIcon />}>
              {t('Pending delete')}
            </Label>
          ) : (
            <StatusCell status={eventStream?.status} />
          ),
      },
      {
        header: t('Channel name'),
        type: 'description',
        value: (eventStream) => eventStream?.channel_name,
        table: ColumnTableOption.expanded,
        card: 'hidden',
        list: 'secondary',
        modal: 'hidden',
        dashboard: 'hidden',
      },
      {
        header: t('Created'),
        type: 'datetime',
        value: (eventStream) => eventStream.created_at,
        table: ColumnTableOption.expanded,
        card: 'hidden',
        list: 'secondary',
        modal: 'hidden',
        dashboard: 'hidden',
      },
      {
        header: t('Last modified'),
        type: 'datetime',
        value: (eventStream) => eventStream.modified_at,
        table: ColumnTableOption.expanded,
        card: 'hidden',
        list: 'secondary',
        modal: 'hidden',
        dashboard: 'hidden',
      },
    ],
    [getPageUrl, t]
  );
}
