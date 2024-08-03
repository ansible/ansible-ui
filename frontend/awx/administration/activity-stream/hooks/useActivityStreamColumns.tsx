import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ColumnModalOption, DateTimeCell, ITableColumn } from '../../../../../framework';
import { ActivityStream } from '../../../interfaces/ActivityStream';
import { ActivityDescription } from '../components/ActivityDescription';
import { ActivityStreamInitiatedByCell } from '../components/ActivityStreamInitiatedByCell';

export function useActivityStreamColumns(options?: {
  disableSort?: boolean;
  disableLinks?: boolean;
}) {
  const { t } = useTranslation();

  const tableColumns = useMemo<ITableColumn<ActivityStream>[]>(
    () => [
      {
        header: t('Time'),
        cell: (activity_stream: ActivityStream) =>
          activity_stream.timestamp && <DateTimeCell value={activity_stream.timestamp} />,
        sort: 'id', // Timestamp for activity stream is not indexed result in slow query, id is effectively the same and more performant.
        list: 'secondary',
        defaultSortDirection: 'desc',
        modal: ColumnModalOption.hidden,
      },
      {
        header: t('Initiated by'),
        cell: (activity_stream: ActivityStream) => (
          <ActivityStreamInitiatedByCell item={activity_stream} options={options} />
        ),
        sort: 'actor__username',
        list: 'secondary',
      },
      {
        header: t('Event'),
        cell: (activity_stream: ActivityStream) => (
          <ActivityDescription activity={activity_stream} />
        ),
        sort: undefined,
        list: 'secondary',
        fullWidth: true,
      },
    ],
    [options, t]
  );
  return tableColumns;
}
