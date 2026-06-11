import { compareStrings } from '@ansible/ansible-ui-framework';
import { useNameColumn } from '@ansible/common-ui/columns';
import { requestDelete } from '@ansible/common-ui/crud/Data';
import { idKeyFn } from '@ansible/common-ui/utils/nameKeyFn';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { edaAPI } from '../../common/eda-utils';
import { useEdaBulkConfirmation } from '../../common/useEdaBulkConfirmation';
import { EdaEventStream } from '../../interfaces/EdaEventStream';
import { useEventStreamColumns } from './useEventStreamColumns';

export function useDeleteEventStreams(onComplete?: (eventStreams: EdaEventStream[]) => void) {
  const { t } = useTranslation();
  const confirmationColumns = useEventStreamColumns({ disableLinks: true });
  const deleteActionNameColumn = useNameColumn({ disableLinks: true, disableSort: true });
  const actionColumns = useMemo(() => [deleteActionNameColumn], [deleteActionNameColumn]);
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
        keyFn: idKeyFn,
        isDanger: true,
        confirmationColumns,
        actionColumns,
        onComplete,
        actionFn: (eventStream: EdaEventStream, signal) => {
          const url = edaAPI`/event-streams/` + `${eventStream.id.toString()}/`;
          return requestDelete(url, signal);
        },
      });
    },
    [actionColumns, bulkAction, confirmationColumns, onComplete, t]
  );
}
