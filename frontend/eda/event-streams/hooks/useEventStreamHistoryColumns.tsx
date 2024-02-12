import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { DateTimeCell, ITableColumn, TextCell, useGetPageUrl } from '../../../../framework';
import { StatusCell } from '../../../common/Status';
import { EdaEventStreamInstance } from '../../interfaces/EdaEventStreamInstance';
import { EdaRoute } from '../../main/EdaRoutes';

export function useEventStreamHistoryColumns() {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  return useMemo<ITableColumn<EdaEventStreamInstance>[]>(
    () => [
      {
        header: t('Name'),
        cell: (instance) => (
          <TextCell
            text={`${instance?.id || ''} - ${instance?.name || ''}`}
            to={getPageUrl(EdaRoute.EventStreamInstancePage, {
              params: { id: instance.event_stream_id, instanceId: instance.id },
            })}
          />
        ),
        card: 'name',
        list: 'name',
      },
      {
        header: t('Status'),
        cell: (instance: EdaEventStreamInstance) => <StatusCell status={instance.status} />,
      },
      {
        header: t('Start date'),
        cell: (instance) => <DateTimeCell value={instance.started_at} />,
      },
    ],
    [getPageUrl, t]
  );
}
