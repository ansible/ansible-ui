import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { compareStrings } from '../../../../framework';
import { requestDelete } from '../../../common/crud/Data';
import { edaAPI } from '../../common/eda-utils';
import { EdaEventStream } from '../../interfaces/EdaEventStream';
import { useEdaBulkConfirmation } from '../../common/useEdaBulkConfirmation';
import { useEventStreamColumns } from './useEventStreamColumns';

export function useDeleteEventStreams(onComplete: (eventStreams: EdaEventStream[]) => void) {
  const { t } = useTranslation();
  const confirmationColumns = useEventStreamColumns();
  const actionColumns = useMemo(() => [confirmationColumns[0]], [confirmationColumns]);
  const bulkAction = useEdaBulkConfirmation<EdaEventStream>();
  return useCallback(
    (eventStreams: EdaEventStream[]) => {
      bulkAction({
        title: t('Permanently delete event streams', { count: eventStreams.length }),
        confirmText: t('Yes, I confirm that I want to delete these {{count}} event streams.', {
          count: eventStreams.length,
        }),
        actionButtonText: t('Delete event streams', { count: eventStreams.length }),
        items: eventStreams.sort((l, r) => compareStrings(l.name, r.name)),
        keyFn: (item) => item?.id,
        isDanger: true,
        confirmationColumns,
        actionColumns,
        onComplete,
        actionFn: (eventStream: EdaEventStream, signal) =>
          requestDelete(edaAPI`/event-streams/${eventStream.id.toString()}/`, signal),
      });
    },
    [actionColumns, bulkAction, confirmationColumns, onComplete, t]
  );
}
