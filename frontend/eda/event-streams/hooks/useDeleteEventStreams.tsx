import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { compareStrings } from '../../../../framework';
import { useNameColumn } from '../../../common/columns';
import { requestDelete } from '../../../common/crud/Data';
import { idKeyFn } from '../../../common/utils/nameKeyFn';
import { edaAPI } from '../../common/eda-utils';
import { EdaEventStream } from '../../interfaces/EdaEventStream';
import { useEventStreamColumns } from './useEventStreamColumns';
import { useEdaBulkConfirmation } from '../../common/useEdaBulkConfirmation';

export function useDeleteEventStreams(onComplete?: (webhooks: EdaEventStream[]) => void) {
  const { t } = useTranslation();
  const confirmationColumns = useEventStreamColumns();
  const deleteActionNameColumn = useNameColumn({ disableLinks: true, disableSort: true });
  const actionColumns = useMemo(() => [deleteActionNameColumn], [deleteActionNameColumn]);
  const bulkAction = useEdaBulkConfirmation<EdaEventStream>();
  return useCallback(
    (webhooks: EdaEventStream[]) => {
      bulkAction({
        title: t('Permanently delete event streams', { count: webhooks.length }),
        confirmText: t('Yes, I confirm that I want to delete these {{count}} event streams.', {
          count: webhooks.length,
        }),
        actionButtonText: t('Delete event streams', { count: webhooks.length }),
        items: webhooks.sort((l, r) => compareStrings(l.name, r.name)),
        keyFn: idKeyFn,
        isDanger: true,
        confirmationColumns,
        actionColumns,
        onComplete,
        actionFn: (webhook: EdaEventStream, signal) => {
          const url = edaAPI`/event-streams/` + `${webhook.id.toString()}/`;
          return requestDelete(url, signal);
        },
      });
    },
    [actionColumns, bulkAction, confirmationColumns, onComplete, t]
  );
}
